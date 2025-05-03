import React, { useState, useEffect } from 'react';
import '../../css/POSSystem.css';

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

const POSSystem: React.FC = () => {
    // Mock product data
    const mockProducts: Product[] = [
        { id: 1, name: 'เบอร์เกอร์เนื้อ', price: 79, image: 'https://png.pngtree.com/png-vector/20230831/ourmid/pngtree-3d-rendering-of-burger-png-png-image_9192426.png', category: 'อาหาร' },
        { id: 2, name: 'แซนวิช', price: 59, image: 'https://img.wongnai.com/p/256x256/2023/05/09/20e0f6217ca3444fbf09e999f4141fc1.jpg', category: 'อาหาร' },
        { id: 3, name: 'ชาเขียวเย็น', price: 45, image: 'https://png.pngtree.com/png-vector/20240626/ourmid/pngtree-a-tall-cup-of-frozen-green-tea-png-image_12841362.png', category: 'เครื่องดื่ม' },
        { id: 4, name: 'ซินนามอนโรล', price: 35, image: 'https://img.wongnai.com/p/256x256/2023/06/08/ea6fb1e1ee894404a247cdd546206255.jpg', category: 'ของหวาน' },
        { id: 5, name: 'โดนัทช็อกโกแลต', price: 29, image: 'https://png.pngtree.com/png-clipart/20241102/original/pngtree-chocolate-donut-with-nuts-clipart-illustration-high-resolution-isolated-free-png-image_16640127.png', category: 'ของหวาน' },
        { id: 6, name: 'ครัวซองต์', price: 45, image: 'https://png.pngtree.com/png-vector/20240201/ourmid/pngtree-two-croissants-on-a-plate-ai-generated-png-image_11526214.png', category: 'อาหาร' },
        { id: 7, name: 'กาแฟเย็น', price: 55, image: 'https://png.pngtree.com/png-clipart/20250106/original/pngtree-iced-coffee-in-cafe-setting-png-image_18847105.png', category: 'เครื่องดื่ม' },
        { id: 8, name: 'ช็อกโกแลตเย็น', price: 39, image: 'https://cdn.pixabay.com/photo/2024/03/27/05/43/chocolate-8658265_640.png', category: 'เครื่องดื่ม' },
    ];

    // States
    const [products] = useState<Product[]>(mockProducts);                   // สินค้าทั้งหมด (ไม่เปลี่ยนแปลง)
    const [cart, setCart] = useState<CartItem[]>([]);                       // สินค้าในตะกร้า
    const [cartState, setCartState] = useState<CartState>({                 // สถานะตะกร้า (รวมถึงการตรวจสอบว่าตะกร้าว่างหรือไม่)
        items: [],
        isEmpty: true
    });
    const [searchTerm, setSearchTerm] = useState<string>('');               // คำค้นหา
    const [cashAmount, setCashAmount] = useState<number>(0);                // จำนวนเงินที่ลูกค้าจ่าย
    const [showReceipt, setShowReceipt] = useState<boolean>(false);         // สถานะการแสดงใบเสร็จ
    const [receiptNo, setReceiptNo] = useState<string>('');                 // หมายเลขใบเสร็จ
    const [receiptDate, setReceiptDate] = useState<string>('');             // วันที่ใบเสร็จ
    const [activeCategory, setActiveCategory] = useState<string>('ทั้งหมด');  // หมวดหมู่ที่เลือก
    const [notification, setNotification] = useState<NotificationProps>({   // การแจ้งเตือน
        show: false,
        message: '',
        type: 'info'
    });
    const [activeMenu, setActiveMenu] = useState('orders');                 // เมนูที่เลือกใน sidebar

    // Calculate totals
    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);    // คำนวณยอดรวมทั้งหมดในตะกร้า
    const changeAmount = cashAmount - cartTotal;                                            // คำนวณเงินทอน

    // เมื่อ component โหลดครั้งแรก (mount) ให้สร้างหมายเลขใบเสร็จ
    useEffect(() => {
        const now = new Date();
        const receiptNumber = `VRU-TH-${Math.floor(Math.random() * 99999)}`;
        const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear().toString()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        setReceiptNo(receiptNumber);
        setReceiptDate(formattedDate);
    }, []);

    // เมื่อตะกร้ามีการเปลี่ยนแปลง ให้อัปเดต cartState
    useEffect(() => {
        setCartState({
            items: cart,
            isEmpty: cart.length === 0
        });
    }, [cart]);

    // Filter products by search term and category
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'ทั้งหมด' || product.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    // Show notification
    const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' | 'confirm') => {
        setNotification({ show: true, message, type });

        // Auto-hide after 3 seconds
        setTimeout(() => {
            setNotification({ show: false, message: '', type: 'info' });
        }, 3000);
    };

    // เพิ่มสินค้าเข้าตะกร้า 
    const addToCart = (product: Product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);

            if (existingItem) {
                return prevCart.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item       // ถ้ามีอยู่แล้วเพิ่มจำนวน
                );
            } else {
                return [...prevCart, { ...product, quantity: 1 }];      // ถ้าไม่มีเพิ่มเป็นรายการใหม่
            }
        });
    };

    // ลบสินค้าออกจากตะกร้า
    const removeFromCart = (productId: number) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === productId);

            if (existingItem && existingItem.quantity > 1) {
                return prevCart.map(item =>
                    item.id === productId ? { ...item, quantity: item.quantity - 1 } : item    // ลดจำนวนถ้ามากกว่า 1
                );
            } else {
                return prevCart.filter(item => item.id !== productId);    // ลบออกถ้ามีแค่ 1 ชิ้น
            }
        });
    };

    // รีเซ็ตตะกร้า
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

    // เมื่อเปลี่ยนจำนวนเงินสด
    const handleCashAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value === '' ? 0 : parseInt(e.target.value);
        setCashAmount(isNaN(value) ? 0 : value);
    };

    // เพิ่มเงินสดตามจำนวนที่กำหนด
    const addCashAmount = (amount: number) => {
        setCashAmount(prevAmount => prevAmount + amount);
    };

    // ยืนยันการชำระเงิน
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

    // แก้ไขคำสั่งซื้อ (กลับยังรายการ)
    const editOrder = () => {
        setShowReceipt(false);
        showNotification('กลับมาแก้ไขรายการ', 'info');
    };

    // เสร็จสิ้นการทำรายการ
    const completeTransaction = () => {
        setCart([]);
        setCashAmount(0);
        setShowReceipt(false);

        // สร้างหมายเลขใบเสร็จใหม่
        const now = new Date();
        const receiptNumber = `VRU-TH-${Math.floor(Math.random() * 100000)}`;
        const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear().toString()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        setReceiptNo(receiptNumber);
        setReceiptDate(formattedDate);

        showNotification('ทำรายการเสร็จสิ้น!', 'success');
    };

    // Format price to Thai Baht
    const formatPrice = (price: number) => {
        return `฿${price}`;
    };

    // Notification Component
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

    return (
        <div className="flex h-screen w-full overflow-hidden bg-gray-100">
            {/* Notification Component */}
            <Notification notification={notification} />

            {/* Left sidebar - Menu */}
            <div className="w-18 bg-cyan-600 flex flex-col items-center py-1 shadow-lg">
                {/* Logo */}
                <div className="w-18 h-18 flex items-center justify-center mb-5">
                    <a href="/shop">
                        <img
                            src="https://www.vru.ac.th/wp-content/uploads/2021/02/Untitled-1-Recovered.gif"
                            alt="VRU Logo"
                            className="w-18 h-18 object-contain rounded-lg hover:scale-105 transition-transform"
                        />
                    </a>
                </div>

                {/* Menu Items */}
                <div className="flex flex-col gap-5 items-center flex-grow">
                    {/* Orders */}
                    <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 shadow-md
                        ${activeMenu === 'orders' ? 'bg-white text-cyan-600 transform scale-110 shadow-lg' : 'bg-cyan-700 bg-opacity-20 text-white hover:bg-opacity-30 hover:bg-cyan-300 hover:text-cyan-700 hover:shadow-lg'}`}
                        onClick={() => setActiveMenu('orders')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>

                    {/* Products */}
                    <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 shadow-md
                        ${activeMenu === 'products' ? 'bg-white text-cyan-600 transform scale-110 shadow-lg' : 'bg-cyan-700 bg-opacity-20 text-white hover:bg-opacity-30 hover:bg-cyan-300 hover:text-cyan-700 hover:shadow-lg'}`}
                        onClick={() => setActiveMenu('products')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>

                    {/* Dashboard */}
                    <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 shadow-md
                        ${activeMenu === 'dashboard' ? 'bg-white text-cyan-600 transform scale-110 shadow-lg' : 'bg-cyan-700 bg-opacity-20 text-white hover:bg-opacity-30 hover:bg-cyan-300 hover:text-cyan-700 hover:shadow-lg'}`}
                        onClick={() => setActiveMenu('dashboard')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                    </div>

                    {/* Settings */}
                    <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 shadow-md
                        ${activeMenu === 'settings' ? 'bg-white text-cyan-600 transform scale-110 shadow-lg' : 'bg-cyan-700 bg-opacity-20 text-white hover:bg-opacity-30 hover:bg-cyan-300 hover:text-cyan-700 hover:shadow-lg'}`}
                        onClick={() => setActiveMenu('settings')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>

                    {/* Logout */}
                    <div
                        className={`w-10 h-10 mb-4 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 shadow-md mt-auto
                        ${activeMenu === 'logout' ? 'bg-red-100 text-red-600 transform scale-110 shadow-lg' : 'bg-cyan-700 bg-opacity-20 text-white hover:bg-opacity-30 hover:bg-red-400 hover:text-white hover:shadow-lg'}`}
                        onClick={() => setActiveMenu('logout')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow flex flex-col p-4 bg-gray-100 overflow-y-auto">
                {/* Search Bar */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex-grow relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-cyan-500 text-white rounded-full flex items-center justify-center shadow-sm">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="w-full py-3 px-14 bg-white rounded-full border-none shadow-md focus:ring-2 focus:ring-cyan-300 focus:outline-none transition-all"
                            placeholder="ค้นหาเมนู ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            id="search-input"
                        />
                    </div>
                    <div className="ml-4 w-12 h-12 bg-cyan-500 text-white rounded-full flex items-center justify-center shadow-md relative hover:bg-cyan-600 transition-colors">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            viewBox="0 0 576 512"
                            fill="currentColor"
                        >
                            <path
                                d="M253.3 35.1c6.1-11.8 1.5-26.3-10.2-32.4s-26.3-1.5-32.4 10.2L117.6 192 32 192c-17.7 0-32 14.3-32 32s14.3 32 32 32L83.9 463.5C91 492 116.6 512 146 512L430 512c29.4 0 55-20 62.1-48.5L544 256c17.7 0 32-14.3 32-32s-14.3-32-32-32l-85.6 0L365.3 12.9C359.2 1.2 344.7-3.4 332.9 2.7s-16.3 20.6-10.2 32.4L404.3 192l-232.6 0L253.3 35.1zM192 304l0 96c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-96c0-8.8 7.2-16 16-16s16 7.2 16 16zm96-16c8.8 0 16 7.2 16 16l0 96c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-96c0-8.8 7.2-16 16-16zm128 16l0 96c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-96c0-8.8 7.2-16 16-16s16 7.2 16 16z"
                            />
                        </svg>
                        {cart.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                {cart.reduce((sum, item) => sum + item.quantity, 0)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                    <button
                        className={`px-4 py-1 rounded-full ${activeCategory === 'ทั้งหมด' ? 'bg-cyan-500 text-white' : 'bg-transparent'}`}
                        onClick={() => setActiveCategory('ทั้งหมด')}
                    >
                        ทั้งหมด
                    </button>
                    <button
                        className={`px-4 py-1 rounded-full ${activeCategory === 'อาหาร' ? 'bg-cyan-500 text-white' : 'bg-transparent'}`}
                        onClick={() => setActiveCategory('อาหาร')}
                    >
                        อาหาร
                    </button>
                    <button
                        className={`px-4 py-1 rounded-full ${activeCategory === 'เครื่องดื่ม' ? 'bg-cyan-500 text-white' : 'bg-transparent'}`}
                        onClick={() => setActiveCategory('เครื่องดื่ม')}
                    >
                        เครื่องดื่ม
                    </button>
                    <button
                        className={`px-4 py-1 rounded-full ${activeCategory === 'ของหวาน' ? 'bg-cyan-500 text-white' : 'bg-transparent'}`}
                        onClick={() => setActiveCategory('ของหวาน')}
                    >
                        ของหวาน
                    </button>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 mt-2">
                    {filteredProducts.map(product => (
                        <div
                            className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer hover:bg-cyan-50"
                            key={product.id}
                            onClick={() => addToCart(product)}
                        >
                            <div className="w-45 h-45 bg-cover bg-center mx-auto" style={{ backgroundImage: `url(${product.image})` }}></div>
                            <div className="p-3">
                                <h3 className="text-lg font-medium mb-1">{product.name}</h3>
                                <p className="text-2xl text-cyan-500 font-bold">{formatPrice(product.price)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel - Cart */}
            <div className="w-80 bg-white shadow-xl flex flex-col">
                <div className="flex-grow overflow-y-auto p-4">
                    {cartState.isEmpty ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-8 animate-fade-in">
                            <div className="relative mb-6">
                                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-10 w-10 text-gray-400"
                                        viewBox="0 0 576 512"
                                        fill="currentColor"
                                    >
                                        <path
                                            d="M253.3 35.1c6.1-11.8 1.5-26.3-10.2-32.4s-26.3-1.5-32.4 10.2L117.6 192 32 192c-17.7 0-32 14.3-32 32s14.3 32 32 32L83.9 463.5C91 492 116.6 512 146 512L430 512c29.4 0 55-20 62.1-48.5L544 256c17.7 0 32-14.3 32-32s-14.3-32-32-32l-85.6 0L365.3 12.9C359.2 1.2 344.7-3.4 332.9 2.7s-16.3 20.6-10.2 32.4L404.3 192l-232.6 0L253.3 35.1zM192 304l0 96c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-96c0-8.8 7.2-16 16-16s16 7.2 16 16zm96-16c8.8 0 16 7.2 16 16l0 96c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-96c0-8.8 7.2-16 16-16zm128 16l0 96c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-96c0-8.8 7.2-16 16-16s16 7.2 16 16z"
                                        />
                                    </svg>
                                </div>
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-cyan-500"
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
                            <h3 className="text-lg font-medium text-gray-600 mb-2">คำสั่งซื้อของคุณว่างเปล่า</h3>
                            <p className="text-gray-500 mb-6">กรุณาเพิ่มสินค้าลงในรายการ</p>

                        </div>
                    ) : (
                        <div className="space-y-3">
                            {cart.map(item => (
                                <div
                                    className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                    key={item.id}
                                >
                                    <div className="w-14 h-14 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = '/placeholder-product.png';
                                                e.currentTarget.className = 'w-full h-full object-contain p-2 bg-gray-100';
                                            }}
                                        />
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="text-sm font-medium text-gray-800">{item.name}</h4>
                                        <p className="text-sm text-cyan-500 font-bold">{formatPrice(item.price)}</p>
                                    </div>
                                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-1">
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-2xl w-7 h-7 rounded-full bg-white text-cyan-500 flex items-center justify-center hover:bg-cyan-100 transition-colors shadow-sm"
                                        >
                                            -
                                        </button>
                                        <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => addToCart(item)}
                                            className="w-7 h-7 rounded-full bg-cyan-500 text-white flex items-center justify-center hover:bg-cyan-600 transition-colors shadow-sm"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-5 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg text-gray-600">รวมทั้งสิ้น</h3>
                        <h2 className="text-xl text-green-500 font-bold">{formatPrice(cartTotal)}</h2>
                    </div>

                    <div className="bg-gray-100 p-4 rounded-lg mb-3">
                        <div className="flex items-center mb-4">
                            <label className="text-gray-600 w-14">เงินสด</label>
                            <div className="flex-grow flex">
                                <input
                                    type="number"
                                    className="flex-grow bg-white p-2 border border-gray-200 rounded-l text-right w-10 text-lg font-bold text-gray-600"
                                    value={cashAmount || ''}
                                    onChange={handleCashAmountChange}
                                    placeholder="0"
                                />
                                <button
                                    onClick={() => setCashAmount(0)}
                                    className="px-3 bg-gray-200 text-gray-700 rounded-r hover:bg-gray-300 transition-colors border border-l-0 border-gray-200"
                                    title="Reset cash amount"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
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

                        <div className="grid grid-cols-3 gap-2 mb-1">
                            <button
                                onClick={() => addCashAmount(10)}
                                className="p-2 bg-white border border-gray-200 rounded hover:bg-cyan-100"
                            >
                                +10
                            </button>
                            <button
                                onClick={() => addCashAmount(20)}
                                className="p-2 bg-white border border-gray-200 rounded hover:bg-cyan-100"
                            >
                                +20
                            </button>
                            <button
                                onClick={() => addCashAmount(50)}
                                className="p-2 bg-white border border-gray-200 rounded hover:bg-cyan-100"
                            >
                                +50
                            </button>
                            <button
                                onClick={() => addCashAmount(100)}
                                className="p-2 bg-white border border-gray-200 rounded hover:bg-cyan-100"
                            >
                                +100
                            </button>
                            <button
                                onClick={() => addCashAmount(500)}
                                className="p-2 bg-white border border-gray-200 rounded hover:bg-cyan-100"
                            >
                                +500
                            </button>
                            <button
                                onClick={() => addCashAmount(1000)}
                                className="p-2 bg-white border border-gray-200 rounded hover:bg-cyan-100"
                            >
                                +1000
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-between items-center p-2 bg-cyan-50 rounded mb-4">
                        <h3 className="text-xl text-cyan-500 font-bold">เงินทอน</h3>
                        <h2 className={`text-2xl font-bold ${changeAmount < 0 ? 'text-red-500' : 'text-cyan-500'}`}>
                            {formatPrice(changeAmount >= 0 ? changeAmount : 0)}
                        </h2>
                    </div>

                    <div className="flex gap-2">
                        <button
                            className="flex-1 p-3 bg-red-200 text-red-500 font-medium rounded hover:bg-red-300 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            onClick={resetCart}
                            disabled={cart.length === 0}
                        >
                            ยกเลิก
                        </button>
                        <button
                            className="flex-1 p-3 bg-cyan-500 text-white font-medium rounded hover:bg-cyan-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            onClick={processPayment}
                            disabled={cart.length === 0 || cashAmount < cartTotal}
                        >
                            ยืนยัน
                        </button>
                    </div>
                </div>
            </div>

            {/* Receipt Modal */}
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