import React, { useState, useEffect } from 'react';
import '../../css/POSSystem.css';
import { Menu, X, Search, ShoppingBag, LogOut, Cog, Store, LayoutDashboard, ChevronLeft, ChevronRight, Package, Plus, Edit, Trash2 } from "lucide-react";

interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
    category: string;
}

interface CartItem extends Product {
    quantity: number;
}

interface NotificationProps {
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info' | 'confirm';
    onConfirm?: () => void;
    onCancel?: () => void;
}

interface CartState {
    items: CartItem[];
    isEmpty: boolean;
}

interface ProductFormProps {
    product: Product | null;
    onClose: () => void;
    onSave: () => void;
}

const POSSystem: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [cartState, setCartState] = useState<CartState>({ items: [], isEmpty: true });
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [cashAmount, setCashAmount] = useState<number>(0);
    const [showReceipt, setShowReceipt] = useState<boolean>(false);
    const [receiptNo, setReceiptNo] = useState<string>('');
    const [receiptDate, setReceiptDate] = useState<string>('');
    const [activeCategory, setActiveCategory] = useState<string>('ทั้งหมด');
    const [notification, setNotification] = useState<NotificationProps>({ show: false, message: '', type: 'info' });
    const [activeMenu, setActiveMenu] = useState('orders');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const loadData = async () => {
        try {
            const response = await fetch("/api/productpos");
            if (!response.ok) throw new Error('Failed to fetch products');
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error("There was an error fetching the products!", error);
            showNotification('เกิดข้อผิดพลาดในการโหลดสินค้า', 'error');
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const toggleCart = () => setIsCartOpen(!isCartOpen);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsSidebarOpen(false);
                setIsCartOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const changeAmount = cashAmount - cartTotal;

    useEffect(() => {
        const now = new Date();
        const receiptNumber = `VRU-TH-${Math.floor(Math.random() * 99999)}`;
        const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear().toString()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        setReceiptNo(receiptNumber);
        setReceiptDate(formattedDate);
    }, []);

    useEffect(() => {
        setCartState({ items: cart, isEmpty: cart.length === 0 });
    }, [cart]);

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'ทั้งหมด' || product.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' | 'confirm') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: 'info' }), 3000);
    };

    const addToCart = (product: Product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [...prevCart, { ...product, quantity: 1 }];
            }
        });
    };

    const removeFromCart = (productId: number) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === productId);
            if (existingItem && existingItem.quantity > 1) {
                return prevCart.map(item =>
                    item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
                );
            } else {
                return prevCart.filter(item => item.id !== productId);
            }
        });
    };

    const resetCart = () => {
        setNotification({
            show: true,
            message: 'คุณต้องการยกเลิกรายการทั้งหมดใช่หรือไม่?',
            type: 'confirm',
            onConfirm: () => {
                setCart([]);
                setCashAmount(0);
                showNotification('ยกเลิกรายการทั้งหมดเรียบร้อย', 'success');
            },
            onCancel: () => {
                setNotification({ show: false, message: '', type: 'info' });
            }
        });
    };

    const handleCashAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value === '' ? 0 : parseInt(e.target.value);
        setCashAmount(isNaN(value) ? 0 : value);
    };

    const addCashAmount = (amount: number) => {
        setCashAmount(prevAmount => prevAmount + amount);
    };

    const processPayment = () => {
        if (cart.length === 0) {
            showNotification('ไม่มีสินค้าในตะกร้า!', 'error');
            return;
        }
        if (cashAmount < cartTotal) {
            showNotification('จำนวนเงินไม่เพียงพอ!', 'error');
            return;
        }
        setShowReceipt(true);
    };

    const editOrder = () => {
        setShowReceipt(false);
        showNotification('กลับมาแก้ไขรายการ', 'info');
    };

    const completeTransaction = () => {
        setCart([]);
        setCashAmount(0);
        setShowReceipt(false);
        const now = new Date();
        const receiptNumber = `VRU-TH-${Math.floor(Math.random() * 100000)}`;
        const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear().toString()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        setReceiptNo(receiptNumber);
        setReceiptDate(formattedDate);
        showNotification('ทำรายการเสร็จสิ้น!', 'success');
    };

    const deleteProduct = async (id: number) => {
        if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้?')) return;
        try {
            const response = await fetch(`/api/productpos/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setProducts(products.filter((product) => product.id !== id));
                showNotification('ลบสินค้าสำเร็จ', 'success');
            } else {
                showNotification('ไม่สามารถลบสินค้าได้', 'error');
            }
        } catch (error) {
            showNotification('เกิดข้อผิดพลาดในการลบสินค้า', 'error');
        }
    };

    const formatPrice = (price: number) => `฿${price}`;

    const Notification: React.FC<{ notification: NotificationProps }> = ({ notification }) => {
        if (!notification.show) return null;
        const notificationClasses = {
            success: 'bg-green-100 border-green-500 text-green-700',
            error: 'bg-red-100 border-red-500 text-red-700',
            warning: 'bg-yellow-100 border-yellow-500 text-yellow-700',
            info: 'bg-blue-100 border-blue-500 text-blue-700',
            confirm: 'bg-purple-100 border-purple-500 text-purple-700'
        };
        const iconClasses = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ',
            confirm: '?'
        };
        return (
            <div className="fixed top-4 right-4 max-w-md z-50 animate-bounce">
                <div className={`p-4 rounded-lg shadow-lg border-l-4 ${notificationClasses[notification.type]}`}>
                    <div className="flex items-center">
                        <div className="flex-shrink-0 mr-3 text-xl">
                            {iconClasses[notification.type]}
                        </div>
                        <div className="flex-grow">
                            <p className="font-bold">{notification.message}</p>
                        </div>
                    </div>
                    {notification.type === 'confirm' && (
                        <div className="mt-3 flex justify-end space-x-2">
                            <button
                                onClick={notification.onCancel}
                                className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={notification.onConfirm}
                                className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                            >
                                ตกลง
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const ProductForm: React.FC<ProductFormProps> = ({ product, onClose, onSave }) => {
        const [formData, setFormData] = useState({
            name: product?.name || '',
            price: product?.price || '',
            category: product?.category || '',
        });
        const [image, setImage] = useState<File | null>(null);
        const [error, setError] = useState<string>('');

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setError('');

            const formPayload = new FormData();
            formPayload.append('name', formData.name);
            formPayload.append('price', formData.price.toString());
            formPayload.append('category', formData.category);

            if (image) {
                formPayload.append('image', image);
            } else if (product?.image) {
                formPayload.append('existing_image', product.image);
            }

            // ถ้าเป็นการแก้ไข ให้ spoof method เป็น PUT
            if (product) {
                formPayload.append('_method', 'PUT');
            }

            try {
                const url = product
                    ? `/api/productpos/${product.id}`
                    : '/api/productpos';

                // ใช้ POST เสมอ
                const response = await fetch(url, {
                    method: 'POST',
                    body: formPayload,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'เกิดข้อผิดพลาดในการบันทึก');
                }

                loadData();
                setIsFormOpen(false);
                showNotification(
                    product ? 'แก้ไขสินค้าสำเร็จ' : 'เพิ่มสินค้าสำเร็จ',
                    'success'
                );
            } catch (error: any) {
                console.error('เกิดข้อผิดพลาด:', error);
                setError(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
            }
        };

        return (
            <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl flex flex-col overflow-y-auto animate-fadeIn">
                    <h3 className="text-lg font-bold mb-4">{product ? 'แก้ไขสินค้า' : 'เพิ่มสินค้า'}</h3>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">ชื่อสินค้า</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">ราคา</label>
                            <input
                                type="number"
                                className="w-full p-2 border rounded"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                required
                                min="0"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">หมวดหมู่</label>
                            <select
                                className="w-full p-2 border rounded"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                required
                            >
                                <option value="">เลือกหมวดหมู่</option>
                                <option value="อาหาร">อาหาร</option>
                                <option value="เครื่องดื่ม">เครื่องดื่ม</option>
                                <option value="ของหวาน">ของหวาน</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">รูปภาพ</label>
                            <input
                                type="file"
                                accept="image/*"
                                className="w-full p-2 border rounded"
                                onChange={(e) => setImage(e.target.files?.[0] || null)}
                            />
                            {product?.image && !image && (
                                <img src={product.image} alt="Current" className="mt-2 w-20 h-20 object-cover rounded" />
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 p-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="submit"
                                className="flex-1 p-2 bg-cyan-500 text-white rounded hover:bg-cyan-600"
                            >
                                บันทึก
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col lg:flex-row h-screen w-full overflow-hidden bg-gray-100">
            <Notification notification={notification} />
            <div className="lg:hidden flex items-center justify-between px-4 py-2 bg-cyan-600 text-white shadow-md">
                <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-cyan-700">
                    <Menu size={24} />
                </button>
                <img
                    src="https://www.vru.ac.th/wp-content/uploads/2021/02/Untitled-1-Recovered.gif"
                    alt="VRU Logo"
                    className="h-10 object-contain"
                />
                <button
                    onClick={toggleCart}
                    className="p-2 rounded-lg hover:bg-cyan-700 relative"
                >
                    <ShoppingBag size={24} />
                    {cart.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {cart.reduce((sum, item) => sum + item.quantity, 0)}
                        </span>
                    )}
                </button>
            </div>
            <div
                className={`
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                    lg:translate-x-0 fixed lg:static z-40 h-full
                    w-16 lg:w-16 bg-cyan-600 flex flex-col items-center shadow-lg transition-transform duration-300
                `}
            >
                <div className="lg:hidden absolute top-1/2 -right-4 transform -translate-y-1/2 z-50">
                    <button
                        onClick={toggleSidebar}
                        className="bg-cyan-700 hover:bg-cyan-300 text-white rounded-full p-2 shadow-lg transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                </div>
                <div className="lg:flex w-16 h-16 items-center justify-center">
                    <a href="/shop">
                        <img
                            src="https://www.vru.ac.th/wp-content/uploads/2021/02/Untitled-1-Recovered.gif"
                            alt="VRU Logo"
                            className="w-16 h-16 object-contain rounded-lg hover:scale-105 transition-transform"
                        />
                    </a>
                </div>
                <div className="flex flex-col gap-5 items-center flex-grow">
                    <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 shadow-md
                            ${activeMenu === "orders" ? "bg-white text-cyan-600 transform scale-110 shadow-lg" : "bg-cyan-700 bg-opacity-20 text-white hover:bg-opacity-30 hover:bg-cyan-300 hover:text-cyan-700 hover:shadow-lg"}`}
                        onClick={() => setActiveMenu("orders")}
                    >
                        <Store size={20} />
                    </div>
                    <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 shadow-md
                            ${activeMenu === "products" ? "bg-white text-cyan-600 transform scale-110 shadow-lg" : "bg-cyan-700 bg-opacity-20 text-white hover:bg-opacity-30 hover:bg-cyan-300 hover:text-cyan-700 hover:shadow-lg"}`}
                        onClick={() => setActiveMenu("products")}
                    >
                        <Package size={20} />
                    </div>
                    <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 shadow-md
                            ${activeMenu === "dashboard" ? "bg-white text-cyan-600 transform scale-110 shadow-lg" : "bg-cyan-700 bg-opacity-20 text-white hover:bg-opacity-30 hover:bg-cyan-300 hover:text-cyan-700 hover:shadow-lg"}`}
                        onClick={() => setActiveMenu("dashboard")}
                    >
                        <LayoutDashboard size={20} />
                    </div>
                    <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 shadow-md
                            ${activeMenu === "settings" ? "bg-white text-cyan-600 transform scale-110 shadow-lg" : "bg-cyan-700 bg-opacity-20 text-white hover:bg-opacity-30 hover:bg-cyan-300 hover:text-cyan-700 hover:shadow-lg"}`}
                        onClick={() => setActiveMenu("settings")}
                    >
                        <Cog size={20} />
                    </div>
                    <div
                        className={`w-10 h-10 mb-4 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 shadow-md mt-auto
                            ${activeMenu === "logout" ? "bg-red-100 text-red-600 transform scale-110 shadow-lg" : "bg-cyan-700 bg-opacity-20 text-white hover:bg-opacity-30 hover:bg-red-400 hover:text-white hover:shadow-lg"}`}
                        onClick={() => setActiveMenu("logout")}
                    >
                        <LogOut size={20} />
                    </div>
                </div>
            </div>
            <div className="flex-grow flex flex-col p-4 bg-gray-100 overflow-y-auto">
                {activeMenu === 'products' ? (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">จัดการสินค้า</h2>
                            <button
                                onClick={() => {
                                    setSelectedProduct(null);
                                    setIsFormOpen(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600"
                            >
                                <Plus size={20} />
                                เพิ่มสินค้า
                            </button>
                        </div>
                        <div className="relative mb-4">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-cyan-500 text-white rounded-full flex items-center justify-center shadow-sm">
                                <Search size={16} />
                            </div>
                            <input
                                type="text"
                                className="w-full py-2 sm:py-3 px-12 bg-white rounded-full border-none shadow-md focus:ring-2 focus:ring-cyan-300 focus:outline-none transition-all"
                                placeholder="ค้นหาสินค้า..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="bg-white rounded-lg shadow overflow-hidden max-h-[80vh] overflow-y-auto">
                            <table className="w-full table-auto">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="p-3 text-left text-sm font-medium">รูปภาพ</th>
                                        <th className="p-3 text-left text-sm font-medium">ชื่อสินค้า</th>
                                        <th className="p-3 text-left text-sm font-medium">ราคา</th>
                                        <th className="p-3 text-left text-sm font-medium">หมวดหมู่</th>
                                        <th className="p-3 text-right text-sm font-medium">จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map((product) => (
                                        <tr key={product.id} className="border-b">
                                            <td className="p-3">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-12 h-12 object-cover rounded"
                                                />
                                            </td>
                                            <td className="p-3">{product.name}</td>
                                            <td className="p-3">{formatPrice(product.price)}</td>
                                            <td className="p-3">{product.category}</td>
                                            <td className="p-3 text-right">
                                                <button
                                                    onClick={() => {
                                                        setSelectedProduct(product);
                                                        setIsFormOpen(true);
                                                    }}
                                                    className="p-2 text-cyan-500 hover:text-cyan-700"
                                                >
                                                    <Edit size={20} />
                                                </button>
                                                <button
                                                    onClick={() => deleteProduct(product.id)}
                                                    className="p-2 text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {isFormOpen && (
                            <ProductForm
                                product={selectedProduct}
                                onClose={() => setIsFormOpen(false)}
                                onSave={() => {
                                    loadData();
                                    setIsFormOpen(false);
                                    showNotification(
                                        selectedProduct ? 'แก้ไขสินค้าสสำเร็จ' : 'เพิ่มสินค้าสำเร็จ',
                                        'success'
                                    );
                                }}
                            />
                        )}
                    </>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex-grow relative">
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-cyan-500 text-white rounded-full flex items-center justify-center shadow-sm">
                                    <Search size={16} />
                                </div>
                                <input
                                    type="text"
                                    className="w-full py-2 sm:py-3 px-12 bg-white rounded-full border-none shadow-md focus:ring-2 focus:ring-cyan-300 focus:outline-none transition-all"
                                    placeholder="ค้นหาเมนู ..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    id="search-input"
                                />
                            </div>
                            <div className="ml-2 lg:ml-4 w-10 h-10 lg:w-12 lg:h-12 bg-cyan-500 text-white rounded-full flex items-center justify-center shadow-md relative hover:bg-cyan-600 transition-colors hidden sm:hidden lg:flex">
                                <button onClick={toggleCart}>
                                    <ShoppingBag size={20} />
                                    {cart.length > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                            {cart.reduce((sum, item) => sum + item.quantity, 0)}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="flex-row gap-2 mb-4 no-scrollbar">
                            <button
                                className={`px-3 py-1 rounded-full text-sm ${activeCategory === "ทั้งหมด" ? "bg-cyan-500 text-white" : "bg-transparent"}`}
                                onClick={() => setActiveCategory("ทั้งหมด")}
                            >
                                ทั้งหมด
                            </button>
                            <button
                                className={`px-3 py-1 rounded-full text-sm ${activeCategory === "อาหาร" ? "bg-cyan-500 text-white" : "bg-transparent"}`}
                                onClick={() => setActiveCategory("อาหาร")}
                            >
                                อาหาร
                            </button>
                            <button
                                className={`px-3 py-1 rounded-full text-sm ${activeCategory === "เครื่องดื่ม" ? "bg-cyan-500 text-white" : "bg-transparent"}`}
                                onClick={() => setActiveCategory("เครื่องดื่ม")}
                            >
                                เครื่องดื่ม
                            </button>
                            <button
                                className={`px-3 py-1 rounded-full text-sm ${activeCategory === "ของหวาน" ? "bg-cyan-500 text-white" : "bg-transparent"}`}
                                onClick={() => setActiveCategory("ของหวาน")}
                            >
                                ของหวาน
                            </button>
                        </div>
                        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 p-4">
                            {filteredProducts.map((product) => (
                                <div
                                    className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer hover:bg-cyan-50"
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                >
                                    <div className="w-full aspect-square mx-auto lg:w-40">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="p-3">
                                        <h3 className="text-base sm:text-lg font-medium mb-1 bottom-0">{product.name}</h3>
                                        <p className="text-xl sm:text-2xl text-cyan-500 font-bold bottom-0">
                                            {formatPrice(product.price)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
            <div
                className={`
                    ${isCartOpen ? 'translate-x-0' : 'translate-x-full'} 
                    lg:translate-x-0 fixed lg:static right-0 top-0 z-40 h-full
                    w-full sm:w-80 bg-white shadow-xl flex flex-col transition-transform duration-300
                `}
            >
                <div className="lg:hidden flex items-center p-4 border-b">
                    <button onClick={toggleCart} className="mr-2">
                        <ChevronRight size={24} />
                    </button>
                    <h2 className="text-lg font-medium">รายการคำสั่งซื้อ</h2>
                </div>
                <div className="flex-grow overflow-y-auto p-4">
                    {cartState.isEmpty ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-8 animate-fade-in">
                            <div className="relative mb-6">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 flex items-center justify-center">
                                    <ShoppingBag className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                                </div>
                                <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-cyan-100 rounded-full flex items-center justify-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-500"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-base sm:text-lg font-medium text-gray-600 mb-2">
                                คำสั่งซื้อของคุณว่างเปล่า
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                กรุณาเพิ่มสินค้าในรายการ
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {cart.map((item) => (
                                <div
                                    className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                    key={item.id}
                                >
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = "/api/placeholder/100/100";
                                                e.currentTarget.className = "w-full h-full object-contain p-2 bg-gray-100";
                                            }}
                                        />
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="text-sm sm:text-sm font-medium text-gray-800">
                                            {item.name}
                                        </h4>
                                        <p className="text-sm sm:text-sm text-cyan-500 font-bold">
                                            {formatPrice(item.price)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 rounded-full px-2 py-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeFromCart(item.id);
                                            }}
                                            className="text-xl w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white text-cyan-500 flex items-center justify-center hover:bg-cyan-100 transition-colors shadow-sm"
                                        >
                                            -
                                        </button>
                                        <span className="text-xs sm:text-sm font-medium w-4 text-center">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addToCart(item);
                                            }}
                                            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-cyan-500 text-white flex items-center justify-center hover:bg-cyan-600 transition-colors shadow-sm"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="p-4 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-base sm:text-lg text-gray-600">รวมทั้งสิ้น</h3>
                        <h2 className="text-lg sm:text-xl text-green-500 font-bold">
                            {formatPrice(cartTotal)}
                        </h2>
                    </div>
                    <div className="bg-gray-100 p-3 sm:p-4 rounded-lg mb-3">
                        <div className="flex items-center mb-3 sm:mb-4">
                            <label className="text-gray-600 w-12 sm:w-14 text-sm">เงินสด</label>
                            <div className="flex-grow flex">
                                <input
                                    type="number"
                                    className="flex-grow bg-white p-1 sm:p-2 border border-gray-200 rounded-l text-right w-8 sm:w-10 text-base sm:text-lg font-bold text-gray-600"
                                    value={cashAmount || ""}
                                    onChange={handleCashAmountChange}
                                    placeholder="0"
                                />
                                <button
                                    onClick={() => setCashAmount(0)}
                                    className="px-2 sm:px-3 bg-gray-200 text-gray-700 rounded-r hover:bg-gray-300 transition-colors border border-l-0 border-gray-200"
                                    title="Reset cash amount"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 sm:h-5 sm:w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-1">
                            <button
                                onClick={() => addCashAmount(10)}
                                className="p-1 sm:p-2 bg-white border border-gray-200 rounded hover:bg-cyan-100 text-sm"
                            >
                                +10
                            </button>
                            <button
                                onClick={() => addCashAmount(20)}
                                className="p-1 sm:p-2 bg-white border border-gray-200 rounded hover:bg-cyan-100 text-sm"
                            >
                                +20
                            </button>
                            <button
                                onClick={() => addCashAmount(50)}
                                className="p-1 sm:p-2 bg-white border border-gray-200 rounded hover:bg-cyan-100 text-sm"
                            >
                                +50
                            </button>
                            <button
                                onClick={() => addCashAmount(100)}
                                className="p-1 sm:p-2 bg-white border border-gray-200 rounded hover:bg-cyan-100 text-sm"
                            >
                                +100
                            </button>
                            <button
                                onClick={() => addCashAmount(500)}
                                className="p-1 sm:p-2 bg-white border border-gray-200 rounded hover:bg-cyan-100 text-sm"
                            >
                                +500
                            </button>
                            <button
                                onClick={() => addCashAmount(1000)}
                                className="p-1 sm:p-2 bg-white border border-gray-200 rounded hover:bg-cyan-100 text-sm"
                            >
                                +1000
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-cyan-50 rounded mb-4">
                        <h3 className="text-lg sm:text-xl text-cyan-500 font-bold">เงินทอน</h3>
                        <h2
                            className={`text-xl sm:text-2xl font-bold ${changeAmount < 0 ? "text-red-500" : "text-cyan-500"}`}
                        >
                            {formatPrice(changeAmount >= 0 ? changeAmount : 0)}
                        </h2>
                    </div>
                    <div className="flex gap-2">
                        <button
                            className="flex-1 p-2 sm:p-3 bg-red-200 text-red-500 font-medium rounded hover:bg-red-300 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm sm:text-base"
                            onClick={resetCart}
                            disabled={cart.length === 0}
                        >
                            ยกเลิก
                        </button>
                        <button
                            className="flex-1 p-2 sm:p-3 bg-cyan-500 text-white font-medium rounded hover:bg-cyan-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm sm:text-base"
                            onClick={processPayment}
                            disabled={cart.length === 0 || cashAmount < cartTotal}
                        >
                            ยืนยัน
                        </button>
                    </div>
                </div>
            </div>
            {showReceipt && (
                <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white w-80 max-h-[90vh] rounded-lg p-5 shadow-2xl flex flex-col overflow-y-auto animate-fadeIn">
                        <div className="text-center mb-1">
                            <div className="text-white rounded flex items-center justify-center text-xl font-bold mx-auto mb-2">
                                <img src='https://www.vru.ac.th/wp-content/uploads/2021/02/Untitled-1-Recovered.gif' width={150} alt="VRU Logo"></img>
                            </div>
                            <h2 className="text-lg font-bold mb-1">ระบบขายหน้าร้าน</h2>
                            <p className="text-sm text-gray-600">สาขาย่อย ม.วไลย์อลงกรณ์</p>
                            <div className="mt-3 flex justify-between text-xs text-gray-500">
                                <p>เลขที่: {receiptNo}</p>
                                <p>{receiptDate}</p>
                            </div>
                        </div>
                        <table className="w-full mb-2">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left p-2 text-sm">#</th>
                                    <th className="text-left p-2 text-sm">รายการ</th>
                                    <th className="text-center p-2 text-sm">จำนวน</th>
                                    <th className="text-right p-2 text-sm">ราคารวม</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cart.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="p-2 text-sm align-top">{index + 1}</td>
                                        <td className="p-2 text-sm align-top">
                                            {item.name}
                                            <br />
                                            <small className="text-gray-500">{formatPrice(item.price)}</small>
                                        </td>
                                        <td className="p-2 text-center text-sm align-top">{item.quantity}</td>
                                        <td className="p-2 text-right text-sm align-top">{formatPrice(item.price * item.quantity)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="mb-3">
                            <div className="flex justify-between py-1 text-sm">
                                <p>รวมทั้งสิ้น</p>
                                <p>{formatPrice(cartTotal)}</p>
                            </div>
                            <div className="flex justify-between py-1 text-sm">
                                <p>รับเงิน</p>
                                <p>{formatPrice(cashAmount)}</p>
                            </div>
                            <div className="flex justify-between py-2 text-sm border-t border-dashed border-gray-200 font-bold">
                                <p>เงินทอน</p>
                                <p>{formatPrice(changeAmount)}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-auto">
                            <button
                                className="flex-1 p-3 bg-yellow-100 text-yellow-600 font-medium rounded hover:bg-yellow-200 transition-colors"
                                onClick={editOrder}
                            >
                                แก้ไข
                            </button>
                            <button
                                className="flex-1 p-3 bg-cyan-500 text-white font-medium rounded hover:bg-cyan-600 transition-colors"
                                onClick={completeTransaction}
                            >
                                เสร็จสิ้น
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default POSSystem;