import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, get, set } from 'firebase/database';
import Sidebar from '../../../components/SidebarGestock';
import jsPDF from 'jspdf';
import { Icon } from '@iconify/react';

import { getAuth, onAuthStateChanged } from 'firebase/auth';

const Estoque = () => {
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isClosing, setIsClosing] = useState(false);
    const [suppliers, setSuppliers] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [hasSuppliers, setHasSuppliers] = useState(false);

    const [isStockRegisterModalOpen, setIsStockRegisterModalOpen] = useState(false);
    const [isStockRegisterModalClosing, setIsStockRegisterModalClosing] = useState(false);

    const [searchQuery, setSearchQuery] = useState(''); // Estado para armazenar a pesquisa

    const navigate = useNavigate();

    const toggleModal = () => {
        if (showModal) {
            setIsClosing(true);
            setTimeout(() => {
                setShowModal(false);
                setIsClosing(false);
            }, 300); // Tempo da animação de saída
        } else {
            setShowModal(true);
        }
    };

    const [isSuccessVisible, setIsSuccessVisible] = useState(false);

    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);



    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log(`Usuário logado: ${user.email}`);
                fetchProducts(user.email); // Chama fetchProducts com o e-mail do usuário
            } else {
                console.log('Nenhum usuário logado');
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    // Função para buscar produtos do Firebase
const fetchProducts = async (userEmail) => {
        try {
            const db = getDatabase();
            const productRef = ref(db, 'products');
            const groupsRef = ref(db, 'groups');
            const productSnapshot = await get(productRef);
            const groupsSnapshot = await get(groupsRef);

            if (productSnapshot.exists() && groupsSnapshot.exists()) {
                const productsData = productSnapshot.val();
                const groupsData = groupsSnapshot.val();

                // Converte os dados de produtos em uma lista
                const productsList = Object.keys(productsData).map((key) => ({
                    sku: key,
                    sender: productsData[key].sender || 'Não informado', 
                    ...productsData[key].infoProduct, 
                }));

                // Filtra os produtos que têm o sender igual ao e-mail do usuário
                const filteredBySender = productsList.filter((product) => product.sender === userEmail);

                // Filtra os produtos com base nos membros do grupo
                const finalFilteredProducts = [];
                for (let product of filteredBySender) {
                    // Verifica se o 'sender' e o 'userEmail' estão nos membros do grupo
                    const group = Object.values(groupsData).find((group) => 
                        group.members?.includes(product.sender) && group.members?.includes(userEmail)
                    );

                    if (group) {
                        finalFilteredProducts.push(product);
                    }
                }

                setProducts(finalFilteredProducts); // Define os produtos filtrados
                setFilteredProducts(finalFilteredProducts); // Atualiza a lista filtrada
            } else {
                console.log('Nenhum produto ou grupo encontrado.');
            }
        } catch (error) {
            console.error('Erro ao carregar os dados do Firebase:', error);
        } finally {
            setLoading(false);
        }
    };

    const [filteredProducts, setFilteredProducts] = useState([]); // Armazena os produtos filtrados


    useEffect(() => {
        fetchProducts();
    }, []);

    const handleAddProduct = () => {
        navigate('/dadosProdutos1');
    };

    const handleGearClick = (product) => {
        setSelectedProduct(product);
        toggleModal();
    };

    const generatePDF = () => {
        if (!selectedProduct) return;

        const doc = new jsPDF();
        const marginLeft = 14;
        const maxWidth = 180;
        let currentY = 20;

        // Cabeçalho
        doc.setFontSize(18);
        doc.text('Relatório do Produto', marginLeft, currentY);
        currentY += 10;

        doc.setFontSize(12);
        doc.text(`Nome: ${selectedProduct.step1.name || 'N/A'}`, marginLeft, currentY);
        currentY += 10;
        doc.text(`SKU: ${selectedProduct.sku || 'N/A'}`, marginLeft, currentY);
        currentY += 10;
        doc.text(`Categoria: ${selectedProduct.step1.category || 'N/A'}`, marginLeft, currentY);
        currentY += 10;
        doc.text(`Unidade: ${selectedProduct.step1.unit || 'N/A'}`, marginLeft, currentY);
        currentY += 10;

        const descriptionLines = doc.splitTextToSize(selectedProduct.step1.description || 'N/A', maxWidth);
        doc.text('Descrição:', marginLeft, currentY);
        currentY += 10;
        doc.text(descriptionLines, marginLeft, currentY);
        currentY += descriptionLines.length * 7; // Avança para a próxima seção com base no número de linhas
        currentY += 10;

        // Primeira Divisão
        doc.setFontSize(14);
        doc.text('Informações de Estoque:', marginLeft, currentY);
        currentY += 10;

        doc.setFontSize(12);
        const estoqueFields = [
            { label: 'Endereçamento', value: selectedProduct.step2.addressing },
            { label: 'Demanda', value: selectedProduct.step2.demand },
            { label: 'Estoque Máximo', value: selectedProduct.step2.maxStock },
            { label: 'Estoque Mínimo', value: selectedProduct.step2.minStock },
            { label: 'Movimentação', value: selectedProduct.step2.movement },
            { label: 'Estoque de Segurança', value: selectedProduct.step2.securityStock },
            { label: 'Tipo de Estoque', value: selectedProduct.step2.stockType },
        ];

        estoqueFields.forEach((field) => {
            const textLines = doc.splitTextToSize(`${field.label}: ${field.value || 'N/A'}`, maxWidth);
            doc.text(textLines, marginLeft, currentY);
            currentY += textLines.length * 7;
        });
        currentY += 10;

        doc.setFontSize(14);
        currentY += 10;

        const outrasFields = [
            { label: 'Formato de Endereçamento', value: selectedProduct.step3.addressingFormat },
            { label: 'Kanban', value: selectedProduct.step3.kanban?.charAt(0).toUpperCase() + selectedProduct.step3.kanban?.slice(1) },
            { label: 'Método de Movimentação', value: selectedProduct.step3.movementMethod },
        ];

        outrasFields.forEach((field) => {
            const textLines = doc.splitTextToSize(`${field.label}: ${field.value || 'N/A'}`, maxWidth);
            doc.text(textLines, marginLeft, currentY);
            currentY += textLines.length * 7;
        });

        doc.save(`Relatorio_${selectedProduct.step1.name}.pdf`);
    };

    useEffect(() => {
        const filtered = products.filter((product) =>
            product.step1?.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredProducts(filtered); // Atualiza a lista filtrada
    }, [searchQuery, products]);

    const handleStockClick = (product) => {
        const minStock = parseFloat(product.step2.minStock);  // Garante que o estoque mínimo seja um número
        const quantity = parseFloat(product.step1.quantity);  // Garante que a quantidade seja um número

        console.log(`Estoque mínimo do produto ${product.step1.name}: ${minStock}`);
        console.log(`Quantidade disponível do produto ${product.step1.name}: ${quantity}`);

        if (quantity < minStock) {
            alert(`A quantidade disponível do produto ${product.step1.name} é menor que o estoque mínimo!`);
        } else {
            alert(`A quantidade disponível do produto ${product.step1.name} é suficiente.`);
        }
    };

    const getIconColor = (product) => {
        const minStock = parseFloat(product.step2.minStock); // Estoque mínimo
        const securityStock = parseFloat(product.step2.securityStock); // Estoque de segurança
        const maxStock = parseFloat(product.step2.maxStock); // Estoque máximo
        const quantity = parseFloat(product.step1.quantity); // Quantidade disponível

        if (quantity > maxStock) {
            return 'purple'; // Maior que o estoque máximo
        } else if (quantity < minStock) {
            return 'red'; // Menor que o estoque mínimo
        } else if (quantity >= minStock && quantity < securityStock) {
            return 'orange'; // Maior que o estoque mínimo mas menor que o estoque de segurança
        } else {
            return 'green'; // Maior que o estoque de segurança
        }
    };

    const getTooltipText = (product) => {
        const minStock = parseFloat(product.step2.minStock);
        const securityStock = parseFloat(product.step2.securityStock);
        const maxStock = parseFloat(product.step2.maxStock);
        const quantity = parseFloat(product.step1.quantity);

        if (quantity > maxStock) {
            return 'Quantidade maior que o estoque máximo!';
        } else if (quantity < minStock) {
            return 'Quantidade menor que o estoque mínimo!';
        } else if (quantity >= minStock && quantity < securityStock) {
            return 'Quantidade entre o estoque mínimo e o estoque de segurança.';
        } else {
            return 'Quantidade suficiente, acima do estoque de segurança.';
        }
    };

    const [sortOption, setSortOption] = useState("");

    const handleSortChange = (e) => {
        setSortOption(e.target.value);
    };

    const sortProducts = (products) => {
        switch (sortOption) {
            case "A-Z":
                return products.sort((a, b) => a.step1.name.localeCompare(b.step1.name));
            case "Z-A":
                return products.sort((a, b) => b.step1.name.localeCompare(a.step1.name));
            case "Maior Quantidade":
                return products.sort((a, b) => b.step1.quantity - a.step1.quantity);
            case "Menor Quantidade":
                return products.sort((a, b) => a.step1.quantity - b.step1.quantity);
            default:
                return products; // Sem ordenação
        }
    };

    const filteredAndSortedProducts = sortProducts(
        products.filter((product) =>
            product.step1.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
    const [isQuotationModalClosing, setIsQuotationModalClosing] = useState(false);
    const [selectedSuppliers, setSelectedSuppliers] = useState([]);

    const toggleStockRegisterModal = async (product) => {
        if (isStockRegisterModalOpen) {
            setIsStockRegisterModalClosing(true);
            setTimeout(() => {
                setIsStockRegisterModalOpen(false);
                setIsStockRegisterModalClosing(false);
            }, 300);
        } else {
            setIsStockRegisterModalOpen(true);
            setSelectedProduct(product);

            try {
                const db = getDatabase();
                const productsRef = ref(db, `products/${product.sku}`);
                const snapshot = await get(productsRef);

                if (snapshot.exists()) {
                    const productData = snapshot.val();

                    // Verifica se existem fornecedores no produto
                    const suppliers = Object.keys(productData.fornecedores || {}).map((fornecedorId) => {
                        const fornecedorData = productData.fornecedores[fornecedorId];
                        return {
                            id: fornecedorId,
                            razaoSocial: fornecedorData?.step1?.razaoSocial || 'Razão Social não informada',
                        };
                    });

                    setSuppliers(suppliers);
                    setHasSuppliers(suppliers.length > 0); // Define se há fornecedores
                } else {
                    console.error("Produto não encontrado no banco de dados.");
                    setSuppliers([]);
                    setHasSuppliers(false); // Sem fornecedores
                }
            } catch (error) {
                console.error("Erro ao buscar fornecedores:", error);
                setSuppliers([]);
                setHasSuppliers(false); // Em caso de erro
            }
        }
    };

    const toggleQuotationModal = async () => {
        if (isQuotationModalOpen) {
            setIsQuotationModalClosing(true);
            setTimeout(() => {
                setIsQuotationModalOpen(false);
                setIsQuotationModalClosing(false);
            }, 300); // Animação de fechamento
        } else {
            setIsQuotationModalOpen(true);

            try {
                if (suppliers.length > 0) {
                    setSelectedSuppliers(suppliers);
                } else {
                    console.error("Nenhum fornecedor disponível para cotação.");
                    setSelectedSuppliers([]);
                }
            } catch (error) {
                console.error("Erro ao carregar fornecedores para cotação:", error);
            }
        }
    };

    const [selectedSupplierInfo, setSelectedSupplierInfo] = useState(null);

    const handleStartQuotation = () => {
        if (!selectedSupplier) {
            console.error("Por favor, selecione um fornecedor antes de iniciar a cotação.");
            return;
        }

        const supplier = selectedSuppliers.find((s) => s.id === selectedSupplier);
        if (supplier) {
            console.log("Fornecedor selecionado:", supplier);
            console.log("SKU do produto:", selectedProduct?.sku);
            navigate('/cotacao-fornecedores', {
                state: {
                    id: supplier.id,
                    razaoSocial: supplier.razaoSocial,
                    sku: selectedProduct?.sku,
                },
            });
        } else {
            console.error("Fornecedor não encontrado.");
        }
    };

    const capitalizeFirstLetter = (str) => {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    const downloadStockRegisterPDF = () => {
        if (!selectedProduct) return;

        const doc = new jsPDF();
        const marginLeft = 14;
        const maxWidth = 180;
        let currentY = 20;
        const pageHeight = 280;

        const checkPageBreak = (doc, currentY) => {
            if (currentY >= pageHeight - 20) { // Subtrai margem inferior
                doc.addPage();
                return 20; // Reinicia posição do cursor
            }
            return currentY;
        };

        // Cabeçalho
        doc.setFontSize(18);
        doc.text('Relatório de Gerenciamento de Estoque - Matéria Prima', marginLeft, currentY);
        currentY += 10;

        doc.setFontSize(12);
        doc.text(`Nome: ${selectedProduct.step1.name || 'N/A'}`, marginLeft, currentY);
        currentY += 10;
        doc.text(`Descrição: ${selectedProduct.step1.description || 'N/A'}`, marginLeft, currentY);
        currentY += 10;
        doc.text(`Categoria: ${selectedProduct.step1.category || 'N/A'}`, marginLeft, currentY);
        currentY += 10;
        doc.text(`Quantidade: ${selectedProduct.step1.quantity || 'N/A'}`, marginLeft, currentY);
        currentY += 10;
        doc.text(`SKU: ${selectedProduct.sku || 'N/A'}`, marginLeft, currentY);
        currentY += 10;

        // Informações de Estoque
        doc.setFontSize(14);
        doc.text('Detalhes do Estoque:', marginLeft, currentY);
        currentY += 10;

        doc.setFontSize(12);
        const stockDetails = [
            { label: 'Estoque Mínimo', value: selectedProduct.step2.minStock },
            { label: 'Estoque Máximo', value: selectedProduct.step2.maxStock },
            { label: 'Estoque de Segurança', value: selectedProduct.step2.securityStock },
            { label: 'Método de Movimentação', value: selectedProduct.step3.movementMethod },
        ];

        stockDetails.forEach((detail) => {
            const lines = doc.splitTextToSize(`${detail.label}: ${detail.value || 'N/A'}`, maxWidth);
            lines.forEach(line => {
                doc.text(line, marginLeft, currentY);
                currentY += 7;
                currentY = checkPageBreak(doc, currentY); // Verifica quebra de página
            });
        });

        if (suppliers.length > 0) {
            currentY += 10;
            doc.setFontSize(14);
            doc.text('Fornecedores:', marginLeft, currentY);
            currentY += 10;
            currentY = checkPageBreak(doc, currentY);

            suppliers.forEach((supplier, index) => {
                doc.setFontSize(12);

                doc.text(`Fornecedor ${index + 1}.`, marginLeft, currentY);
                currentY += 7;
                currentY = checkPageBreak(doc, currentY);

                doc.text(`   Razão Social: ${supplier.razaoSocial || 'N/A'}`, marginLeft + 10, currentY);
                currentY += 7;
                currentY = checkPageBreak(doc, currentY);

                const supplierCNPJPath = `products/${selectedProduct.sku}/fornecedores/${supplier.id}/step1/cnpj`;
                const supplierTipoFornecedorPath = `products/${selectedProduct.sku}/fornecedores/${supplier.id}/step1/tipoFornecedor`;
                const supplierAvaliacaoPath = `products/${selectedProduct.sku}/fornecedores/${supplier.id}/step2/avaliacao`;
                const supplierCnpjAtivoPath = `products/${selectedProduct.sku}/fornecedores/${supplier.id}/step2/cnpjAtivo`;
                const supplierHabilitacaoJuridicaPath = `products/${selectedProduct.sku}/fornecedores/${supplier.id}/step2/habilitacaoJuridica`;
                const supplierHabilitacoesTecnicasPath = `products/${selectedProduct.sku}/fornecedores/${supplier.id}/step2/habilitacoesTecnicas`;
                const supplierRAPath = `products/${selectedProduct.sku}/fornecedores/${supplier.id}/step2/ra`;
                const supplierRegularidadeFiscalPath = `products/${selectedProduct.sku}/fornecedores/${supplier.id}/step2/regularidadeFiscal`;
                const supplierSituacaoEconomicaPath = `products/${selectedProduct.sku}/fornecedores/${supplier.id}/step2/situacaoEconomica`;
                const supplierTempoDeMercadoPath = `products/${selectedProduct.sku}/fornecedores/${supplier.id}/step2/tempoDeMercado`;
                const supplierCertificadosPath = `products/${selectedProduct.sku}/fornecedores/${supplier.id}/step3/certificados`;

                const supplierCustoPath = `products/${selectedProduct.sku}/fornecedores/${supplier.id}/cotacao/custo`;
                const supplierFretePath = `products/${selectedProduct.sku}/fornecedores/${supplier.id}/cotacao/frete`;
                const supplierQuantidadePath = `products/${selectedProduct.sku}/fornecedores/${supplier.id}/cotacao/quantidade`;
                const supplierTempoEntregaPath = `products/${selectedProduct.sku}/fornecedores/${supplier.id}/cotacao/tempoEntrega`;
                const supplierTipoConferenciaPath = `products/${selectedProduct.sku}/fornecedores/${supplier.id}/cotacao/tipoConferencia`;

                const db = getDatabase();
                const supplierCNPJRef = ref(db, supplierCNPJPath);
                const supplierTipoFornecedorRef = ref(db, supplierTipoFornecedorPath);
                const supplierAvaliacaoRef = ref(db, supplierAvaliacaoPath);
                const supplierCnpjAtivoRef = ref(db, supplierCnpjAtivoPath);
                const supplierHabilitacaoJuridicaRef = ref(db, supplierHabilitacaoJuridicaPath);
                const supplierHabilitacoesTecnicasRef = ref(db, supplierHabilitacoesTecnicasPath);
                const supplierRARef = ref(db, supplierRAPath);
                const supplierRegularidadeFiscalRef = ref(db, supplierRegularidadeFiscalPath);
                const supplierSituacaoEconomicaRef = ref(db, supplierSituacaoEconomicaPath);
                const supplierTempoDeMercadoRef = ref(db, supplierTempoDeMercadoPath);
                const supplierCertificadosRef = ref(db, supplierCertificadosPath);

                const supplierCustoRef = ref(db, supplierCustoPath);
                const supplierFreteRef = ref(db, supplierFretePath);
                const supplierQuantidadeRef = ref(db, supplierQuantidadePath);
                const supplierTempoEntregaRef = ref(db, supplierTempoEntregaPath);
                const supplierTipoConferenciaRef = ref(db, supplierTipoConferenciaPath);

                Promise.all([
                    get(supplierCNPJRef),
                    get(supplierTipoFornecedorRef),
                    get(supplierAvaliacaoRef),
                    get(supplierCnpjAtivoRef),
                    get(supplierHabilitacaoJuridicaRef),
                    get(supplierHabilitacoesTecnicasRef),
                    get(supplierRARef),
                    get(supplierRegularidadeFiscalRef),
                    get(supplierSituacaoEconomicaRef),
                    get(supplierTempoDeMercadoRef),
                    get(supplierCertificadosRef),
                    get(supplierCustoRef),
                    get(supplierFreteRef),
                    get(supplierQuantidadeRef),
                    get(supplierTempoEntregaRef),
                    get(supplierTipoConferenciaRef)
                ]).then(([
                    cnpjSnapshot, tipoFornecedorSnapshot, avaliacaoSnapshot, cnpjAtivoSnapshot,
                    habilitacaoJuridicaSnapshot, habilitacoesTecnicasSnapshot, raSnapshot,
                    regularidadeFiscalSnapshot, situacaoEconomicaSnapshot, tempoDeMercadoSnapshot,
                    certificadosSnapshot, custoSnapshot, freteSnapshot, quantidadeSnapshot,
                    tempoEntregaSnapshot, tipoConferenciaSnapshot
                ]) => {
                    const cnpj = cnpjSnapshot.exists() ? cnpjSnapshot.val() : 'N/A';
                    const tipoFornecedor = tipoFornecedorSnapshot.exists() ? tipoFornecedorSnapshot.val() : 'N/A';
                    const avaliacao = avaliacaoSnapshot.exists() ? avaliacaoSnapshot.val() : 'N/A';
                    const cnpjAtivo = cnpjAtivoSnapshot.exists() ? cnpjAtivoSnapshot.val() : 'N/A';
                    const habilitacaoJuridica = habilitacaoJuridicaSnapshot.exists() ? habilitacaoJuridicaSnapshot.val() : 'N/A';
                    const habilitacoesTecnicas = habilitacoesTecnicasSnapshot.exists() ? habilitacoesTecnicasSnapshot.val() : 'N/A';
                    const ra = raSnapshot.exists() ? raSnapshot.val() : 'N/A';
                    const regularidadeFiscal = regularidadeFiscalSnapshot.exists() ? regularidadeFiscalSnapshot.val() : 'N/A';
                    const situacaoEconomica = situacaoEconomicaSnapshot.exists() ? situacaoEconomicaSnapshot.val() : 'N/A';
                    const tempoDeMercado = tempoDeMercadoSnapshot.exists() ? tempoDeMercadoSnapshot.val() : 'N/A';
                    const certificados = certificadosSnapshot.exists() ? certificadosSnapshot.val() : [];

                    const custo = custoSnapshot.exists() ? custoSnapshot.val() : 'N/A';
                    const frete = freteSnapshot.exists() ? freteSnapshot.val() : 'N/A';
                    const quantidade = quantidadeSnapshot.exists() ? quantidadeSnapshot.val() : 'N/A';
                    const tempoEntrega = tempoEntregaSnapshot.exists() ? tempoEntregaSnapshot.val() : 'N/A';
                    const tipoConferencia = tipoConferenciaSnapshot.exists() ? tipoConferenciaSnapshot.val() : 'N/A';

                    doc.text(`   CNPJ: ${cnpj}`, marginLeft + 10, currentY);
                    currentY += 7;
                    currentY = checkPageBreak(doc, currentY);

                    doc.text(`   Tipo de Fornecedor: ${capitalizeFirstLetter(tipoFornecedor)}`, marginLeft + 10, currentY);
                    currentY += 10;
                    currentY = checkPageBreak(doc, currentY);

                    doc.text(`   Avaliação: ${capitalizeFirstLetter(avaliacao)}`, marginLeft + 10, currentY);
                    currentY += 7;
                    currentY = checkPageBreak(doc, currentY);

                    doc.text(`   CNPJ Ativo: ${cnpjAtivo}`, marginLeft + 10, currentY);
                    currentY += 7;
                    currentY = checkPageBreak(doc, currentY);

                    doc.text(`   Habilitação Jurídica: ${habilitacaoJuridica}`, marginLeft + 10, currentY);
                    currentY += 7;
                    currentY = checkPageBreak(doc, currentY);

                    doc.text(`   Habilitações Técnicas: ${habilitacoesTecnicas}`, marginLeft + 10, currentY);
                    currentY += 7;
                    currentY = checkPageBreak(doc, currentY);

                    doc.text(`   RA: ${capitalizeFirstLetter(ra)}`, marginLeft + 10, currentY);
                    currentY += 7;
                    currentY = checkPageBreak(doc, currentY);

                    doc.text(`   Regularidade Fiscal: ${regularidadeFiscal}`, marginLeft + 10, currentY);
                    currentY += 7;
                    currentY = checkPageBreak(doc, currentY);

                    doc.text(`   Situação Econômica: ${situacaoEconomica}`, marginLeft + 10, currentY);
                    currentY += 7;
                    currentY = checkPageBreak(doc, currentY);

                    doc.text(`   Tempo de Mercado: ${tempoDeMercado}`, marginLeft + 10, currentY);
                    currentY += 10;
                    currentY = checkPageBreak(doc, currentY);

                    certificados.forEach((certificado, certIndex) => {
                        doc.text(`   Certificado ${certIndex + 1}: ${certificado || 'N/A'}`, marginLeft + 10, currentY);
                        currentY += 7;
                        currentY = checkPageBreak(doc, currentY);
                    });

                    if (custo !== 'N/A' || frete !== 'N/A' || quantidade !== 'N/A' || tempoEntrega !== 'N/A' || tipoConferencia !== 'N/A') {
                        currentY += 5;
                        doc.setFontSize(12);
                        doc.text('Cotação:', marginLeft, currentY);
                        currentY += 7;
                        currentY = checkPageBreak(doc, currentY);

                        if (custo !== 'N/A') {
                            doc.text(`   Custo: ${custo}`, marginLeft + 10, currentY);
                            currentY += 7;
                            currentY = checkPageBreak(doc, currentY);
                        }

                        if (frete !== 'N/A') {
                            doc.text(`   Frete: ${frete}`, marginLeft + 10, currentY);
                            currentY += 7;
                            currentY = checkPageBreak(doc, currentY);
                        }

                        if (quantidade !== 'N/A') {
                            doc.text(`   Quantidade: ${quantidade}`, marginLeft + 10, currentY);
                            currentY += 7;
                            currentY = checkPageBreak(doc, currentY);
                        }

                        if (tempoEntrega !== 'N/A') {
                            doc.text(`   Tempo de Entrega: ${tempoEntrega}`, marginLeft + 10, currentY);
                            currentY += 7;
                            currentY = checkPageBreak(doc, currentY);
                        }

                        if (tipoConferencia !== 'N/A') {
                            doc.text(`   Tipo de Conferência: ${tipoConferencia}`, marginLeft + 10, currentY);
                            currentY += 7;
                            currentY = checkPageBreak(doc, currentY);
                        }
                    } else {
                        // Aviso se não houver cotação
                        doc.text('   Nenhuma cotação disponível para este fornecedor.', marginLeft + 10, currentY);
                        currentY += 7;
                    }
                    doc.save(`Estoque_${selectedProduct.sku}_Fornecedores.pdf`);
                });

                currentY = checkPageBreak(doc, currentY);
            });
        }
    };

    const [isEditing, setIsEditing] = useState(false);

    const handleEditClick = () => {
        setIsEditing(!isEditing);
    };

    const handleInputChange = (e, field) => {
        const { value } = e.target;
        setSelectedProduct(prevState => ({
            ...prevState,
            step1: {
                ...prevState.step1,
                [field]: value
            },
            step2: {
                ...prevState.step2,
                [field]: value
            }
        }));
    };
    const handleSaveChanges = async () => {
        try {
            const db = getDatabase();
            const productRef = ref(db, `products/${selectedProduct.sku}/infoProduct`);

            const snapshot = await get(productRef);

            if (snapshot.exists()) {
                const currentData = snapshot.val();

                const updatedData = {
                    ...currentData,
                    step1: {
                        ...currentData.step1,
                        ...selectedProduct.step1,
                    },
                    step2: {
                        ...currentData.step2,
                        ...selectedProduct.step2,
                    },
                    fornecedores: suppliers.reduce((acc, supplier, index) => {
                        acc[`fornecedor_${index}`] = { step1: supplier };
                        return acc;
                    }, {}),
                };

                // Salva as alterações no banco
                await set(productRef, updatedData);

                // Atualiza o estado local de produtos
                setProducts((prevProducts) =>
                    prevProducts.map((product) =>
                        product.sku === selectedProduct.sku
                            ? { ...product, ...updatedData }
                            : product
                    )
                );

                setIsEditing(false);
                setIsSuccessVisible(true);

                // Oculta o aviso após 3 segundos
                setTimeout(() => {
                    setIsSuccessVisible(false);
                }, 3000);
            } else {
                console.error("Produto não encontrado para edição.");
            }
        } catch (error) {
            console.error("Erro ao salvar as alterações:", error);
        }
    };


    const handleCancelChanges = () => {
        setSelectedProduct(prevState => ({
            ...prevState,
            step1: { ...prevState.step1 },
        }));
        setIsEditing(false);
    };

    return (
        <div className="dashboard">
            <Sidebar className="sidebar-container" />
            <div className="stock_main-content">
                <div className='stock_title'>Estoque - Matéria-prima</div>
                <header className="stock_header">
                    <div className="stock_search-add-container">
                        <button
                            className="stock_add-product-button"
                            onClick={handleAddProduct}
                        >
                            + Adicionar Novo Produto
                        </button>
                        <div className="stock_search-container">
                            <Icon icon="mdi:search" className="stock_search-icon" />
                            <input
                                type="text"
                                placeholder="Pesquisar produtos"
                                className="search-input"
                                value={searchQuery} // Vincula o estado de pesquisa
                                onChange={(e) => setSearchQuery(e.target.value)} // Atualiza o valor de pesquisa
                            />
                        </div>
                    </div>

                    <div className="stock_button-group">
                        <div className="stock_sort-options">
                            <select id="sort" value={sortOption} onChange={handleSortChange}>
                                <option value="">Ordenar por</option>
                                <option value="A-Z">A-Z</option>
                                <option value="Z-A">Z-A</option>
                                <option value="Maior Quantidade">Maior Quantidade</option>
                                <option value="Menor Quantidade">Menor Quantidade</option>
                            </select>
                        </div>
                    </div>
                </header>

                <div className="stock_product-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Detalhes do Produto</th>
                                <th>Categoria</th>
                                <th>Quantidade</th>
                                <th>SKU</th>
                                <th className='stock_stock'>Estoque</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6">Carregando produtos...</td>
                                </tr>
                            ) : filteredProducts.length > 0 ? (
                                filteredAndSortedProducts.map((product, index) => (
                                    <tr key={index} className='stock_product-item'>
                                        <td>
                                            <div className="stock_product-details">
                                                <Icon
                                                    icon="fa6-solid:eye"
                                                    width="25"
                                                    height="25"
                                                    className='icon stock_product-icon-details'
                                                    onClick={() => handleGearClick(product)}
                                                />                                                <div>
                                                    <h5>{product.step1.name}</h5>
                                                    <p className='stock_product-details-descrption'>{product.step1.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{product.step1.category}</td>

                                        <td>{product.step1.quantity}</td>
                                        <td>{product.sku}</td>
                                        <td>
                                            <span
                                                onClick={() => handleStockClick(product)}
                                                data-tooltip={getTooltipText(product)}
                                            >
                                                <Icon
                                                    icon="ix:circle-dot"
                                                    style={{
                                                        color: getIconColor(product),
                                                        cursor: 'pointer',
                                                        fontSize: '24px'
                                                    }}
                                                />
                                            </span>
                                        </td>
                                        <td className='stock_product-obeservation'>
                                            <Icon
                                                icon="fa6-solid:gear"
                                                width="25"
                                                height="25"
                                                className="icon"
                                                onClick={() => toggleStockRegisterModal(product)}
                                            />
                                        </td>

                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6">Nenhum produto encontrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {showModal && selectedProduct && (
                    <div className={`products_stock_modal-overlay ${showModal ? 'products_stock_modal-overlay-visible' : ''}`}>
                        <div className={`products_stock_modal-content ${isClosing ? 'closing' : 'products_stock_modal-content-visible'}`}>
                            <div className="products_stock_modal-header">
                                <div className="products_stock_modal-title">
                                    <h2>{selectedProduct.step1.name}</h2>
                                    <p className="products_stock_modal-quantity">Quantidade: <b>{selectedProduct.step1.quantity}</b></p>
                                    <p className="products_stock_modal-quantity">Estoque Mínimo: <b>{selectedProduct.step2.minStock}</b></p>
                                    <p className="products_stock_modal-quantity">Estoque de Segurança: <b>{selectedProduct.step2.securityStock}</b></p>
                                    <p className="products_stock_modal-quantity">Estoque Máximo: <b>{selectedProduct.step2.maxStock}</b></p>
                                    <div className="products_stock_sku-components">
                                        <td className="products_stock_stock_category-modal">{selectedProduct.step1.category}</td>
                                    </div>
                                </div>
                                <td>
                                    <span className="products_stock_stock_sku">{selectedProduct.sku}</span>
                                </td>
                            </div>
                            <div className="products_stock_modal-text">
                                <span>Descrição: </span>
                                <p>{selectedProduct.step1.description}</p>
                            </div>

                            <div className='products_stock_modal-flex-buttons'>
                                <button className="products_stock_modal-close-button" onClick={toggleModal}>
                                    Fechar
                                </button>

                                <button
                                    className='stock_product-info-button'
                                    onClick={generatePDF}
                                >
                                    <div class="stock_product-info-svg-wrapper-1">
                                        <div class="stock_product-info-svg-wrapper">
                                            <Icon className="stock_product-info-icon" icon="ic:round-download" />
                                        </div>
                                    </div>
                                    <p class="stock_product-info-text">Baixar Relatório</p>
                                </button>

                            </div>
                        </div>
                    </div>
                )}

                {isStockRegisterModalOpen && (
                    <div
                        className={`stock_modal-register-overlay ${isStockRegisterModalClosing ? 'stock_modal-register-closing' : ''}`}
                    >
                        <div className="stock_modal-register">
                            <h3>Gerenciar Produto
                                <Icon
                                    icon={isEditing ? "material-symbols:save" : "lets-icons:edit-fill"}
                                    className="icon"
                                    onClick={handleEditClick}  // Alterna entre editar e salvar
                                />
                            </h3>
                            <form>
                                <div className="stock_coolinput">
                                    <label htmlFor="input" className="stock_text">Nome do produto:</label>
                                    <input
                                        value={selectedProduct?.step1?.name || ''}
                                        onChange={(e) => handleInputChange(e, 'name')}
                                        type="text"
                                        placeholder="Digite aqui..."
                                        name="input"
                                        className="stock_input"
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="stock_coolinput">
                                    <label htmlFor="input" className="stock_text">Descrição do Produto:</label>
                                    <textarea
                                        value={selectedProduct?.step1?.description || ''}
                                        onChange={(e) => handleInputChange(e, 'description')}
                                        placeholder="Digite aqui..."
                                        type="text"
                                        name="input"
                                        className="stock_input"
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="stock_coolinput">
                                    <label htmlFor="input" className="stock_text">Categoria:</label>
                                    <input
                                        value={selectedProduct?.step1?.category || ''}
                                        onChange={(e) => handleInputChange(e, 'category')}
                                        type="text"
                                        placeholder="Digite aqui..."
                                        name="input"
                                        className="stock_input"
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="stock_coolinput">
                                        <label htmlFor="input" className="stock_text">Quantidade:</label>
                                        <input
                                            value={selectedProduct?.step1?.quantity || ''}
                                            onChange={(e) => handleInputChange(e, 'quantity')}
                                            type="text"
                                            placeholder="Digite aqui..."
                                            name="input"
                                            className="stock_input"
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="stock_coolinput">
                                        <label htmlFor="input" className="stock_text">SKU:</label>
                                        <input
                                            value={selectedProduct?.sku || ''}
                                            type="text"
                                            disabled
                                            placeholder="Digite aqui..."
                                            name="input"
                                            className="stock_input"
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="stock_coolinput">
                                        <label htmlFor="input" className="stock_text">Estoque Mínimo:</label>
                                        <input
                                            value={selectedProduct?.step2?.minStock || ''}
                                            onChange={(e) => handleInputChange(e, 'minStock')}
                                            type="text"
                                            placeholder="Digite aqui..."
                                            name="input"
                                            className="stock_input"
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="stock_coolinput">
                                        <label htmlFor="input" className="stock_text">Estoque Máximo:</label>
                                        <input
                                            value={selectedProduct?.step2?.maxStock || ''}
                                            onChange={(e) => handleInputChange(e, 'maxStock')}
                                            type="text"
                                            placeholder="Digite aqui..."
                                            name="input"
                                            className="stock_input"
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>

                                <div className="stock_coolinput">
                                    <label htmlFor="input" className="stock_text">Estoque de Segurança:</label>
                                    <input
                                        value={selectedProduct?.step2?.securityStock || ''}
                                        onChange={(e) => handleInputChange(e, 'securityStock', 'step2')}
                                        type="text"
                                        placeholder="Digite aqui..."
                                        name="input"
                                        className="stock_input"
                                        disabled={!isEditing}
                                    />
                                </div>
                                {isEditing ? (
                                    <div>

                                    </div>
                                ) : (
                                    <div className="stock_coolinput">
                                        <label htmlFor="input" className="stock_text">Fornecedores:</label>
                                        <input
                                            type="text"
                                            placeholder="Nenhum fornecedor encontrado"
                                            name="input"
                                            className="stock_input"
                                            value={suppliers.length > 0
                                                ? suppliers.map((supplier) => `${supplier.razaoSocial}`).join(', ')
                                                : 'Nenhum fornecedor encontrado'}
                                            readOnly
                                        />
                                    </div>
                                )}

                                {!isEditing ? (
                                    <>
                                        <div className="stock_modal-register-flex-buttons">
                                            <button
                                                type="button"
                                                className="stock_close-button"
                                                onClick={() => {
                                                    navigate('/dadosFornecedores', { state: { sku: selectedProduct?.sku } });
                                                }}
                                            >
                                                Cadastrar Fornecedores
                                            </button>
                                            <button type="button" className="stock_close-button" onClick={toggleQuotationModal}>Realizar Cotação</button>
                                        </div>
                                        <button
                                            type="button"
                                            className={`stock_close-button ${!hasSuppliers ? "disabled" : ""}`}
                                            onClick={downloadStockRegisterPDF}
                                            disabled={!hasSuppliers}
                                            title={!hasSuppliers ? "Este produto não tem fornecedores disponíveis." : ""}
                                        >
                                            Baixar Relatório
                                            <Icon icon="material-symbols:download" width="24" height="24" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="stock_modal-register-flex-buttons">
                                            <button
                                                type="button"
                                                className="stock_close-button"
                                                onClick={handleCancelChanges} // Cancela alterações
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="button"
                                                className="stock_close-button"
                                                onClick={handleSaveChanges} // Salva alterações
                                            >
                                                Salvar Alterações
                                            </button>
                                        </div>
                                    </>
                                )}

                                <button type="button" className="stock_modal_close-button" onClick={() => toggleStockRegisterModal(null)}>Fechar</button>
                            </form>
                        </div>
                    </div>
                )}

                {isSuccessVisible && (
                    <div className="stock_register-success">
                        <p>Informações salvas com sucesso!</p>
                    </div>
                )}

                {isQuotationModalOpen && (
                    <div
                        className={`quotation-modal-overlay ${isQuotationModalClosing ? 'quotation-modal-closing' : ''}`}
                    >
                        <div className="quotation-modal">
                            <h3>Iniciar Cotação</h3>
                            <form>
                                <div className="input-group">
                                    <label className="input-label">Fornecedores Disponíveis:</label>
                                    <select
                                        className="input-field"
                                        value={selectedSupplier || ""} // Mantém o valor selecionado
                                        onChange={(e) => setSelectedSupplier(e.target.value)} // Atualiza o ID do fornecedor selecionado
                                    >
                                        <option value="" disabled>
                                            Selecione um fornecedor
                                        </option>
                                        {selectedSuppliers.length > 0 ? (
                                            selectedSuppliers.map((supplier) => (
                                                <option key={supplier.id} value={supplier.id}>
                                                    {supplier.razaoSocial}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="" disabled>
                                                Nenhum fornecedor disponível
                                            </option>
                                        )}
                                    </select>

                                </div>
                                <div className="quotation-buttons">
                                    <button
                                        type="button"
                                        className="quotation-button-primary"
                                        onClick={handleStartQuotation} // Chama a função ao clicar
                                    >
                                        Iniciar Cotação
                                    </button>
                                    <button
                                        type="button"
                                        className="quotation-button-close"
                                        onClick={toggleQuotationModal}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Estoque;
