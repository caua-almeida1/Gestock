import React, { useState, useEffect } from 'react';
import Sidebar from '../../../components/SidebarGestock';
import { Icon } from '@iconify/react';
import { getDatabase, ref, onValue, push, update } from 'firebase/database';
import { getAuth } from 'firebase/auth';



export const ProdutoFinal = () => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [isMaterialModalOpen, setMaterialModalOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [rawMaterials, setRawMaterials] = useState([]);
    const [filteredRawMaterials, setFilteredRawMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState("Selecione Um Produto");
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [inputQuantity, setInputQuantity] = useState("");
    const [materialName, setMaterialName] = useState([]);

    const [productName, setProductName] = useState('');
    const [category, setCategory] = useState('');
    const [productQuantity, setProductQuantity] = useState('');
    const [minStock, setMinStock] = useState('');
    const [maxStock, setMaxStock] = useState('');
    const [safetyStock, setSafetyStock] = useState('');

    const [alertMessage, setAlertMessage] = useState("");
    const [showAlert, setShowAlert] = useState(false);


    const [selectedProduct, setSelectedProduct] = useState(null);  // Produto selecionado para visualização

    const [isEditing, setIsEditing] = useState(false);

    const handleEdit = () => {
        setIsEditing(true); // Ativa edição
    };

    const handleSaveChanges = () => {
        if (selectedProduct) {
            const db = getDatabase();
            const productRef = ref(db, `finalProducts/${selectedProduct.id}`);

            const updatedProduct = {
                ...selectedProduct,
                productName,
                category,
                quantity: productQuantity,
                minStock,
                maxStock,
                safetyStock,
            };

            update(productRef, updatedProduct)
                .then(() => {
                    setProducts((prevProducts) =>
                        prevProducts.map((product) =>
                            product.id === selectedProduct.id ? updatedProduct : product
                        )
                    );
                    setIsEditing(false); // Desativa edição após salvar
                })
                .catch((error) => {
                    console.error("Erro ao salvar alterações:", error);
                });
        }
    };

    useEffect(() => {
        if (selectedProduct) {
            setProductName(selectedProduct.productName || '');
            setCategory(selectedProduct.category || '');
            setProductQuantity(selectedProduct.quantity || '');
            setMinStock(selectedProduct.minStock || '');
            setMaxStock(selectedProduct.maxStock || '');
            setSafetyStock(selectedProduct.safetyStock || '');
        }
    }, [selectedProduct]);

    const generateSKU = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const format = 'NNN-NN-NNN-NN';
        let sku = '';
        for (let i = 0; i < format.length; i++) {
            if (format[i] === 'N') {
                sku += chars.charAt(Math.floor(Math.random() * chars.length));
            } else {
                sku += format[i]; // Adiciona os hífens no lugar certo
            }
        }
        return sku;
    };

    const [sku, setSku] = useState(generateSKU());  // Inicializa o SKU com um valor aleatório
    const [userEmail, setUserEmail] = useState(null);  // Estado para armazenar o email do usuário

    useEffect(() => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
            setUserEmail(user.email);  // Salva o e-mail do usuário logado
        }

        const db = getDatabase();

        // Buscando os produtos finais da tabela 'finalProducts'
        const finalProductsRef = ref(db, 'finalProducts');
        onValue(finalProductsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const productList = Object.entries(data).map(([id, product]) => ({ id, ...product }));
                setProducts(productList); // Carrega os produtos finais
            } else {
                setProducts([]);
            }
            setLoading(false);
        });

        // Buscando as matérias-primas
        const rawMaterialsRef = ref(db, 'products');
        onValue(rawMaterialsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const materialList = Object.entries(data).map(([id, material]) => ({ id, ...material }));
                setRawMaterials(materialList);
                const filtered = materialList.filter(material => material.sender === userEmail);
                setFilteredRawMaterials(filtered);
            } else {
                setRawMaterials([]);
            }
        });
    }, [userEmail]);

    const handleOpenModal = () => {
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleOpenMaterialModal = () => {
        setMaterialModalOpen(true);
    };

    const handleCloseMaterialModal = () => {
        setMaterialModalOpen(false);
    };

    const handleMaterialChange = (event) => {
        const selectedMaterialId = event.target.value;
        const selectedMaterial = rawMaterials.find(material => material.id === selectedMaterialId);

        if (selectedMaterial) {
            setSelectedMaterial(selectedMaterial);  // Atualiza a matéria-prima selecionada
            setQuantity(selectedMaterial.infoProduct.step1.quantity);  // Atualiza a quantidade com o valor da matéria-prima
        } else {
            setSelectedMaterial(null);  // Reseta a matéria-prima se não houver seleção
        }
    };

    const handleQuantityChange = (event) => {
        const value = event.target.value;

        // Impede números negativos
        if (value >= 0) {
            setInputQuantity(value);  // Atualiza o valor da quantidade
        }
    };

    const handleAddMaterial = () => {
        if (selectedMaterial && inputQuantity) {
            const formattedMaterial = `${selectedMaterial.infoProduct.step1.name}(${inputQuantity})`; // Nome + quantidade
            setMaterialName((prevMaterials) => [...prevMaterials, formattedMaterial]);
            setInputQuantity(""); // Reseta o valor do input de quantidade
            setSelectedMaterial(null); // Reseta o material selecionado
            handleCloseMaterialModal(); // Fecha o modal de matérias-primas
        }
    };

    const handleResetFields = () => {
        setSku(generateSKU());
        setProductName('');
        setCategory('');
        setProductQuantity('');
        setMinStock('');
        setMaxStock('');
        setSafetyStock('');
        setMaterialName([]);
        setSelectedMaterial(null);
        setInputQuantity('');
        setQuantity('Selecione Um Produto');
    };

    const handleAddFinalProduct = (event) => {
        event.preventDefault();

        if (materialName.length === 0) {
            setAlertMessage("Adicione pelo menos uma matéria-prima antes de salvar o produto.");
            setShowAlert(true);
            return;
        }

        const db = getDatabase();
        const finalProductsRef = ref(db, 'finalProducts');

        const newFinalProduct = {
            productName,
            category,
            quantity: productQuantity,
            minStock,
            maxStock,
            safetyStock,
            sku,
            rawMaterials: materialName,
            createdBy: userEmail,
            createdAt: new Date().toISOString(),
        };

        push(finalProductsRef, newFinalProduct)
            .then(() => {
                setAlertMessage("Produto final adicionado com sucesso!");
                setShowAlert(true);
                handleResetFields();
                handleCloseModal();
            })
            .catch((error) => {
                console.error("Erro ao adicionar produto final:", error);
                setAlertMessage("Houve um erro ao salvar o produto. Tente novamente.");
                setShowAlert(true);
            });
    };

    useEffect(() => {
        if (showAlert) {
            const timer = setTimeout(() => {
                setShowAlert(false); // Fecha o alerta após 2 segundos
            }, 2000);
            return () => clearTimeout(timer); // Limpa o timer quando o componente é desmontado
        }
    }, [showAlert]);

    const [isViewModalOpen, setViewModalOpen] = useState(false);  // Modal de visualização

    const handleViewProduct = (product) => {
        setSelectedProduct(product);  // Armazena o produto selecionado
        setViewModalOpen(true);  // Abre o modal de visualização
    };


    return (
        <div className="dashboard stock_main-body">
            {showAlert && (
                <div className="newproduct_alert">
                    <p>{alertMessage}</p>
                </div>
            )}

            <Sidebar className="sidebar-container" />
            <div className="stock_main-content">
                <div className='stock_title'>Estoque - Produto Final</div>
                <header className="stock_header">
                    <div className="stock_search-add-container">
                        <button
                            className="stock_add-product-button"
                            onClick={handleOpenModal}
                        >
                            + Adicionar Novo Produto
                        </button>
                        <div className="stock_search-container">
                            <Icon icon="mdi:search" className="stock_search-icon" />
                            <input
                                type="text"
                                placeholder="Pesquisar produtos"
                                className="search-input"
                            />
                        </div>
                    </div>

                    <div className="stock_button-group">
                        <div className="stock_sort-options">
                            <select id="sort">
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
                                <th>Nome do Produto</th>
                                <th>Categoria</th>
                                <th>Quantidade</th>
                                <th>SKU</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6">Carregando produtos...</td>
                                </tr>
                            ) : (
                                products.length > 0 ? (
                                    products.map((product) => (
                                        <tr key={product.id}>
                                            <td>{product.productName}</td> {/* Detalhes do Produto */}
                                            <td>{product.category}</td>  {/* Categoria */}
                                            <td>{product.quantity}</td>  {/* Quantidade */}
                                            <td>{product.sku}</td>  {/* SKU */}
                                            <td>
                                                <button
                                                    className="view-button"
                                                    onClick={() => handleViewProduct(product)}
                                                >
                                                    <Icon icon="icon-park-solid:config" className="icon" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6">Nenhum produto encontrado.</td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className={`newproduct_modal-overlay ${isViewModalOpen ? 'show' : ''}`}>
                <div className="newproduct_modal-container">
                    <div className="newproduct_modal-container-header">
                        <h2 className="newproduct_modal-title">Visualizar Produto</h2>
                        {!isEditing && (
                            <button onClick={handleEdit}>
                                <Icon icon="material-symbols:edit" className="icon" />
                            </button>
                        )}
                    </div>
                    <form className="newproduct_form">
                        <label className="newproduct_label">
                            Nome do Produto
                            <input
                                type="text"
                                className="newproduct_input"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                readOnly={!isEditing}
                            />
                        </label>
                        <label className="newproduct_label">
                            Categoria
                            <input
                                type="text"
                                className="newproduct_input"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                readOnly={!isEditing}
                            />
                        </label>
                        <label className="newproduct_label">
                            Quantidade
                            <input
                                type="number"
                                className="newproduct_input"
                                value={productQuantity}
                                onChange={(e) => setProductQuantity(e.target.value)}
                                readOnly={!isEditing}
                            />
                        </label>
                        <label className="newproduct_label">
                            Estoque Mínimo
                            <input
                                type="number"
                                className="newproduct_input"
                                value={minStock}
                                onChange={(e) => setMinStock(e.target.value)}
                                readOnly={!isEditing}
                            />
                        </label>
                        <label className="newproduct_label">
                            Estoque Máximo
                            <input
                                type="number"
                                className="newproduct_input"
                                value={maxStock}
                                onChange={(e) => setMaxStock(e.target.value)}
                                readOnly={!isEditing}
                            />
                        </label>
                        <label className="newproduct_label">
                            Estoque de Segurança
                            <input
                                type="number"
                                className="newproduct_input"
                                value={safetyStock}
                                onChange={(e) => setSafetyStock(e.target.value)}
                                readOnly={!isEditing}
                            />
                        </label>
                        <div className="newproduct_actions">
                            {isEditing && (
                                <button onClick={handleSaveChanges} className="newproduct_button-save-button">
                                    Salvar Alterações
                                </button>
                            )}
                            <button
                                type="button"
                                className="newproduct_button newproduct_button-close"
                                onClick={() => setViewModalOpen(false)}  // Fecha o modal de visualização
                            >
                                Fechar
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className={`newproduct_modal-overlay ${isModalOpen ? 'show' : ''}`}>
                <div className="newproduct_modal-container">
                    <h2 className="newproduct_modal-title">Adicionar Novo Produto</h2>
                    <form className="newproduct_form">
                        <label className="newproduct_label">
                            Nome do Produto
                            <input
                                type="text"
                                className="newproduct_input"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                            />
                        </label>
                        <label className="newproduct_label">
                            Categoria
                            <input
                                type="text"
                                className="newproduct_input"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            />
                        </label>
                        <label className="newproduct_label">
                            Quantidade
                            <input
                                type="number"
                                className="newproduct_input"
                                value={productQuantity}
                                onChange={(e) => setProductQuantity(e.target.value)}
                            />
                        </label>
                        <label className="newproduct_label">
                            Estoque Mínimo
                            <input
                                type="number"
                                className="newproduct_input"
                                value={minStock}
                                onChange={(e) => setMinStock(e.target.value)}
                            />
                        </label>
                        <label className="newproduct_label">
                            Estoque Máximo
                            <input
                                type="number"
                                className="newproduct_input"
                                value={maxStock}
                                onChange={(e) => setMaxStock(e.target.value)}
                            />
                        </label>
                        <label className="newproduct_label">
                            Estoque de Segurança
                            <input
                                type="number"
                                className="newproduct_input"
                                value={safetyStock}
                                onChange={(e) => setSafetyStock(e.target.value)}
                            />
                        </label>
                        <label className="newproduct_label">
                            SKU
                            <input
                                type="text"
                                className="newproduct_input"
                                value={sku}
                                readOnly
                            />
                        </label>
                        <label className="newproduct_label">
                            Matérias Primas
                            <input
                                type="text"
                                className="newproduct_input"
                                value={materialName.join(', ')}
                                readOnly
                            />
                        </label>

                        <button
                            type="button"
                            onClick={handleOpenMaterialModal}
                            className="newproduct_button newproduct_button-primary">
                            Adicionar Matéria Prima
                        </button>
                        <div className="newproduct_actions">

                            <button
                                type="button"
                                className="newproduct_button newproduct_button-close"
                                onClick={() => {
                                    handleResetFields();
                                    handleCloseModal();
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="newproduct_button newproduct_button-primary"
                                onClick={handleAddFinalProduct}
                                disabled={materialName.length === 0}
                                title={materialName.length === 0 ? 'Adicione pelo menos uma matéria-prima antes de prosseguir.' : ''}>
                                Adicionar
                            </button>
                        </div>

                    </form>
                </div>
            </div>


            <div className={`newproduct_modal-overlay ${isMaterialModalOpen ? 'show' : ''}`}>
                <div className="newproduct_modal-container">
                    <h2 className="stock_new-product-matery-modal-title">Adicionar Matéria Prima</h2>
                    <form className="newproduct_form">
                        <label className="newproduct_label">
                            Matérias Primas
                            <select className="newproduct_input" onChange={handleMaterialChange}>
                                <option value="">Selecione uma matéria-prima</option>
                                {filteredRawMaterials.map((material) => (
                                    <option key={material.id} value={material.id}>
                                        {material.infoProduct.step1.name} / {material.sku.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="newproduct_label">
                            Quantidade (Total: {quantity})
                            <input
                                type="number"
                                className="newproduct_input"
                                disabled={!selectedMaterial}
                                min="1"
                                value={inputQuantity}
                                onChange={handleQuantityChange}
                            />
                        </label>
                        <div className="newproduct_actions">
                            <button
                                type="button"
                                className="newproduct_button newproduct_button-close"
                                onClick={handleCloseMaterialModal}>
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="newproduct_button newproduct_button-primary"
                                onClick={handleAddMaterial}>
                                Adicionar Matéria P.
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProdutoFinal;
