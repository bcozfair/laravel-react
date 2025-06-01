import React, { useState, useEffect } from 'react';
import { Menu, X, Search, PenTool, LogOut, Cog, Printer, FileText, LayoutDashboard, ChevronLeft, ReceiptText, Plus, ChevronRight, Edit, Trash2, CheckCircle } from "lucide-react";

interface MaintenanceRequest {
    id: number;
    created_at: string;
    request_no: string;
    description: string;
    category: string;
    status: 'pending' | 'in_progress' | 'completed';
    technician_id: number | null;
    technician?: { name: string };
    customer_name: string;
    customer_phone: string;
}

interface Technician {
    id: number;
    name: string;
    specialty: string;
    contact: string;
}

interface NotificationProps {
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info' | 'confirm';
    onConfirm?: () => void;
    onCancel?: () => void;
}

interface RequestFormProps {
    request: MaintenanceRequest | null;
    technicians: Technician[];
    onClose: () => void;
    onSave: () => void;
}

interface InvoiceFormProps {
    request: MaintenanceRequest;
    invoice?: Invoice | null;
    onClose: () => void;
    onSave: () => void;
}

interface Invoice {
    id: number;
    request_id: number;
    invoice_no: string;
    amount: number;
    issue_date: string;
    due_date: string;
    status: 'unpaid' | 'paid' | 'cancelled';
    items?: Array<{
        description: string;
        quantity: number;
        unit_price: number;
    }>;
}

const MaintenanceRequestSystem: React.FC = () => {
    const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [activeCategory, setActiveCategory] = useState<string>('ทั้งหมด');
    const [notification, setNotification] = useState<NotificationProps>({ show: false, message: '', type: 'info' });
    const [activeMenu, setActiveMenu] = useState('requests');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState<boolean>(false);
    const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [activeTab, setActiveTab] = useState<'requests' | 'invoices'>('requests');

    const loadData = async () => {
        try {
            const [requestsResponse, techniciansResponse] = await Promise.all([
                fetch('/api/maintenance/requests'),
                fetch('/api/maintenance/technicians')
            ]);
            if (!requestsResponse.ok || !techniciansResponse.ok) throw new Error('Failed to fetch data');
            const requestsData = await requestsResponse.json();
            const techniciansData = await techniciansResponse.json();
            setRequests(requestsData);
            setTechnicians(techniciansData);
        } catch (error) {
            console.error("Error fetching data!", error);
            showNotification('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
        }
    };

    const loadInvoices = async () => {
        try {
            const response = await fetch('/api/maintenance/invoices');
            if (!response.ok) throw new Error('Failed to fetch invoices');
            const data = await response.json();
            setInvoices(data);
        } catch (error) {
            showNotification('เกิดข้อผิดพลาดในการโหลดใบแจ้งหนี้', 'error');
        }
    };

    useEffect(() => {
        loadData();
        loadInvoices();
    }, []);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const filteredRequests = requests.filter(request => {
        const search = searchTerm.trim().toLowerCase();
        const matchesSearch =
            !search ||
            request.description.toLowerCase().includes(search) ||
            request.customer_name.toLowerCase().includes(search) ||
            request.customer_phone.toLowerCase().includes(search) ||
            request.request_no.toLowerCase().includes(search);

        const matchesCategory = activeCategory === 'ทั้งหมด' || request.category === activeCategory;
        return matchesSearch && matchesCategory;
    });
    const filteredInvoices = invoices.filter((invoice) => {
        const req = requests.find(r => r.id === invoice.request_id);
        const search = searchTerm.trim().toLowerCase();

        // ถ้ามีการค้นหา ให้ข้ามการกรองหมวดหมู่
        const matchesCategory =
            search
                ? true
                : (activeCategory === 'ทั้งหมด' || (req && req.category === activeCategory));

        const matchesSearch =
            !search ||
            (invoice.invoice_no && invoice.invoice_no.toLowerCase().includes(search)) ||
            (req && (
                req.customer_name.toLowerCase().includes(search) ||
                req.customer_phone.toLowerCase().includes(search) ||
                req.description.toLowerCase().includes(search)
            ));

        return matchesCategory && matchesSearch;
    });

    const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' | 'confirm') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: 'info' }), 3000);
    };

    const deleteRequest = async (id: number) => {
        if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบคำขอนี้?')) return;
        try {
            const response = await fetch(`/api/maintenance/requests/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setRequests(requests.filter((request) => request.id !== id));
                showNotification('ลบคำขอสำเร็จ', 'success');
            } else {
                showNotification('ไม่สามารถลบคำขอได้', 'error');
            }
        } catch (error) {
            showNotification('เกิดข้อผิดพลาดในการลบคำขอ', 'error');
        }
    };

    const deleteInvoice = async (id: number) => {
        if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบใบแจ้งหนี้นี้?')) return;
        try {
            const response = await fetch(`/api/maintenance/invoices/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setInvoices(invoices.filter((invoice) => invoice.id !== id));
                showNotification('ลบใบแจ้งหนี้สำเร็จ', 'success');
            } else {
                showNotification('ไม่สามารถลบใบแจ้งหนี้ได้', 'error');
            }
        } catch (error) {
            showNotification('เกิดข้อผิดพลาดในการลบใบแจ้งหนี้', 'error');
        }
    };

    const markInvoiceAsPaid = async (invoiceId: number) => {
        try {
            const response = await fetch(`/api/maintenance/invoices/${invoiceId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'paid' })
            });
            if (response.ok) {
                setInvoices(invoices.map(invoice =>
                    invoice.id === invoiceId ? { ...invoice, status: 'paid' } : invoice
                ));
                showNotification('เปลี่ยนสถานะเป็นชำระเงินแล้วสำเร็จ', 'success');
            } else {
                showNotification('ไม่สามารถเปลี่ยนสถานะได้', 'error');
            }
        } catch (error) {
            showNotification('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ', 'error');
        }
    };

    const formatStatus = (status: string) => {
        const statusMap: { [key: string]: string } = {
            pending: 'รอดำเนินการ',
            in_progress: 'กำลังดำเนินการ',
            completed: 'เสร็จสิ้น'
        };
        return statusMap[status] || status;
    };

    const Notification: React.FC<{ notification: NotificationProps }> = ({ notification }) => {
        if (!notification.show) return null;
        const notificationClasses = {
            success: 'bg-green-100 border-green-500 text-green-900',
            error: 'bg-red-100 border-red-500 text-red-900',
            warning: 'bg-yellow-100 border-yellow-500 text-yellow-900',
            info: 'bg-blue-100 border-blue-500 text-blue-900',
            confirm: 'bg-purple-100 border-purple-500 text-purple-900'
        };
        const iconClasses = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ',
            confirm: '?'
        };
        return (
            <div className="fixed top-8 right-8 max-w-sm z-50 animate-pulse">
                <div className={`p-4 rounded-xl shadow-2xl border-l-4 ${notificationClasses[notification.type]} transform transition-all duration-500 ease-in-out hover:scale-105`}>
                    <div className="flex items-center">
                        <div className="flex-shrink-0 mr-3 text-lg font-bold">
                            {iconClasses[notification.type]}
                        </div>
                        <div className="flex-grow">
                            <p className="text-sm font-semibold">{notification.message}</p>
                        </div>
                    </div>
                    {notification.type === 'confirm' && (
                        <div className="mt-3 flex justify-end space-x-2">
                            <button
                                onClick={notification.onCancel}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transform hover:scale-105 transition-all duration-200"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={notification.onConfirm}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transform hover:scale-105 transition-all duration-200"
                            >
                                ตกลง
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const RequestForm: React.FC<RequestFormProps> = ({ request, technicians, onClose, onSave }) => {
        const [formData, setFormData] = useState({
            customer_name: request?.customer_name || '',
            customer_phone: request?.customer_phone || '',
            description: request?.description || '',
            category: request?.category || '',
            status: request?.status || 'pending',
            technician_id: request?.technician_id || ''
        });
        const [error, setError] = useState<string>('');

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setError('');

            const payload = {
                customer_name: formData.customer_name,
                customer_phone: formData.customer_phone,
                description: formData.description,
                category: formData.category,
                status: formData.status,
                technician_id: formData.technician_id || null
            };

            try {
                const url = request ? `/api/maintenance/requests/${request.id}` : '/api/maintenance/requests';
                const method = request ? 'PUT' : 'POST';
                const response = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'เกิดข้อผิดพลาดในการบันทึก');
                }

                loadData();
                onSave();
                setIsFormOpen(false);
                showNotification(request ? 'แก้ไขคำขอสำเร็จ' : 'เพิ่มคำขอสำเร็จ', 'success');
            } catch (error: any) {
                setError(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
            }
        };

        return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-md transition-all duration-300">
                <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl flex flex-col animate-fade-in">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">{request ? 'แก้ไขคำขอ' : 'เพิ่มคำขอ'}</h3>
                    {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded-lg">{error}</p>}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อลูกค้า</label>
                            <input
                                type="text"
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                                value={formData.customer_name}
                                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">เบอร์โทรลูกค้า</label>
                            <input
                                type="text"
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                                value={formData.customer_phone}
                                onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">รายละเอียด</label>
                            <input
                                type="text"
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">หมวดหมู่</label>
                            <select
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                required
                            >
                                <option value="">เลือกหมวดหมู่</option>
                                <option value="คอมพิวเตอร์">คอมพิวเตอร์</option>
                                <option value="สมาร์ทโฟน/แท็บเล็ต">สมาร์ทโฟน/แท็บเล็ต</option>
                                <option value="เครื่องปรับอากาศ">เครื่องปรับอากาศ</option>
                                <option value="อื่นๆ">อื่นๆ</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">สถานะ</label>
                            <select
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                            >
                                <option value="pending">รอดำเนินการ</option>
                                <option value="in_progress">กำลังดำเนินการ</option>
                                <option value="completed">เสร็จสิ้น</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">ช่าง</label>
                            <select
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                                value={formData.technician_id}
                                onChange={(e) => setFormData({ ...formData, technician_id: e.target.value })}
                            >
                                <option value="">ไม่มีช่าง</option>
                                {technicians.map(tech => (
                                    <option key={tech.id} value={tech.id}>{tech.name} ({tech.specialty})</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 p-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transform hover:scale-105 transition-all duration-200"
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="submit"
                                className="flex-1 p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200"
                            >
                                บันทึก
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const InvoiceForm: React.FC<InvoiceFormProps> = ({ request, invoice, onClose, onSave }) => {
        const parseItems = (items: any) => {
            if (!items) return [{ description: 'ค่าซ่อมบำรุง', quantity: 1, unit_price: 0 }];
            if (typeof items === 'string') {
                try {
                    const arr = JSON.parse(items);
                    if (Array.isArray(arr)) return arr;
                } catch { }
            }
            if (Array.isArray(items)) return items;
            return [{ description: 'ค่าซ่อมบำรุง', quantity: 1, unit_price: 0 }];
        };

        const [formData, setFormData] = useState({
            amount: invoice?.amount || 0,
            issue_date: invoice?.issue_date || new Date().toISOString().split('T')[0],
            due_date: invoice?.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            items: parseItems(invoice?.items),
            status: invoice?.status || 'unpaid'
        });

        useEffect(() => {
            const totalAmount = formData.items.reduce(
                (sum, item) => sum + (item.quantity * item.unit_price), 0
            );
            setFormData(prev => ({ ...prev, amount: totalAmount }));
        }, [formData.items]);

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();

            try {
                const url = invoice ? `/api/maintenance/invoices/${invoice.id}` : '/api/maintenance/invoices';
                const method = invoice ? 'PUT' : 'POST';
                const payload = {
                    request_id: request.id,
                    amount: formData.amount,
                    issue_date: formData.issue_date,
                    due_date: formData.due_date,
                    items: formData.items,
                    status: formData.status
                };

                const response = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'เกิดข้อผิดพลาดในการบันทึกใบแจ้งหนี้');
                }

                onSave();
                loadInvoices();
                setIsInvoiceFormOpen(false);
                showNotification(invoice ? 'แก้ไขใบแจ้งหนี้สำเร็จ' : 'สร้างใบแจ้งหนี้สำเร็จ', 'success');
            } catch (error: any) {
                showNotification(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
            }
        };

        const handleItemChange = (index: number, field: string, value: any) => {
            const newItems = [...formData.items];
            newItems[index] = { ...newItems[index], [field]: value };
            setFormData({ ...formData, items: newItems });
        };

        const addNewItem = () => {
            setFormData({
                ...formData,
                items: [...formData.items, { description: '', quantity: 1, unit_price: 0 }]
            });
        };

        const removeItem = (index: number) => {
            if (formData.items.length <= 1) return;
            const newItems = formData.items.filter((_, i) => i !== index);
            setFormData({ ...formData, items: newItems });
        };

        const totalAmount = formData.items.reduce(
            (sum, item) => sum + (item.quantity * item.unit_price), 0
        );

        return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-md transition-all duration-300">
                <div className="bg-white rounded-3xl p-8 w-full max-w-3xl shadow-2xl flex flex-col animate-fade-in">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">{invoice ? 'แก้ไขใบแจ้งหนี้' : 'สร้างใบแจ้งหนี้'}</h3>

                    <div className="mb-4 p-3 bg-gray-50 rounded-xl shadow-sm">
                        <p className="text-gray-600 font-medium">หมายเลขคำขอ: {request.request_no}</p>
                        <p className="text-gray-600 font-medium">ลูกค้า: {request.customer_name} ({request.customer_phone})</p>
                        <p className="text-gray-600 font-medium">รายละเอียด: {request.description}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">สถานะการชำระเงิน</label>
                        <select
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                            required
                        >
                            <option value="unpaid">ยังไม่ชำระ</option>
                            <option value="paid">ชำระแล้ว</option>
                            <option value="cancelled">ยกเลิก</option>
                        </select>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">วันที่ออก</label>
                                <input
                                    type="date"
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                                    value={formData.issue_date}
                                    onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">ครบกำหนด</label>
                                <input
                                    type="date"
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                                    value={formData.due_date}
                                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">รายการบริการ</label>
                            {formData.items.map((item, index) => (
                                <div key={index} className="grid grid-cols-12 gap-3 mb-3">
                                    <div className="col-span-6">
                                        <input
                                            type="text"
                                            className="w-full p-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                                            placeholder="รายละเอียดบริการ"
                                            value={item.description}
                                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <input
                                            type="number"
                                            className="w-full p-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                                            placeholder="จำนวน"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                            min="1"
                                            required
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <input
                                            type="number"
                                            className="w-full p-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                                            placeholder="ราคาต่อหน่วย"
                                            value={item.unit_price}
                                            onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                    <div className="col-span-1 flex items-center">
                                        {formData.items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="p-2 text-red-500 hover:text-red-700 transform hover:scale-110 transition-all duration-200"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addNewItem}
                                className="mt-3 flex items-center text-blue-500 hover:text-blue-700 text-sm font-semibold transform hover:scale-105 transition-all duration-200"
                            >
                                <Plus size={16} className="mr-2" />
                                เพิ่มรายการ
                            </button>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-sm">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-700">ยอดรวม</span>
                                <span className="text-xl font-bold text-blue-600">
                                    {totalAmount.toLocaleString()} บาท
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 p-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transform hover:scale-105 transition-all duration-200"
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="submit"
                                className="flex-1 p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:front-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200"
                            >
                                {invoice ? 'บันทึกการแก้ไข' : 'สร้างใบแจ้งหนี้'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col lg:flex-row h-screen w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
            <style>
                {`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes slideIn {
                        from { transform: translateX(100%); }
                        to { transform: translateX(0); }
                    }
                    .animate-fade-in {
                        animation: fadeIn 0.3s ease-out;
                    }
                    .animate-slide-in {
                        animation: slideIn 0.3s ease-out;
                    }
                    .no-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .no-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}
            </style>
            <Notification notification={notification} />
            <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl">
                <button onClick={toggleSidebar} className="p-2 rounded-xl hover:bg-blue-800 transform hover:scale-110 transition-all duration-200">
                    <Menu size={24} />
                </button>
                <img
                    src="https://cdn-icons-png.flaticon.com/512/9679/9679830.png"
                    alt="Logo"
                    className="h-8 object-contain transform hover:scale-110 transition-all duration-200"
                />
                <button className="p-2 rounded-xl hover:bg-blue-800 transform hover:scale-110 transition-all duration-200">
                    <PenTool size={24} />
                </button>
            </div>
            <div
                className={`fixed lg:static z-40 h-full bg-gradient-to-b from-blue-600 to-blue-800 flex flex-col items-start shadow-2xl transition-all duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0 ${isSidebarExpanded ? 'w-64' : 'w-16'}`}
            >
                <div className="lg:hidden absolute top-1/2 -right-4 transform -translate-y-1/2 z-50">
                    <button
                        onClick={toggleSidebar}
                        className="bg-blue-800 hover:bg-blue-600 text-white rounded-full p-2 shadow-lg transform hover:scale-110 transition-all duration-200"
                    >
                        <ChevronLeft size={20} />
                    </button>
                </div>

                <div className="w-full flex items-center justify-between p-4">
                    <a href="/maintenance/requests" className="flex items-center">
                        <img
                            src="https://cdn-icons-png.flaticon.com/512/9679/9679830.png"
                            alt="logo"
                            className={`${isSidebarExpanded ? 'w-10 h-10' : 'hidden'} object-contain rounded-lg hover:scale-110 transition-transform duration-200`}
                        />
                        {isSidebarExpanded && (
                            <span className="ml-2 text-white font-semibold text-lg whitespace-nowrap">
                                ระบบซ่อมบำรุง
                            </span>
                        )}
                    </a>
                    <button
                        onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                        className="hidden lg:block p-2 text-white hover:bg-blue-700 rounded-xl transform hover:scale-110 transition-all duration-200"
                    >
                        {isSidebarExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </button>
                </div>

                <div className="flex flex-col gap-2 w-full px-2 pt-4 flex-grow">
                    <div
                        className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 ${activeMenu === 'requests' ? 'bg-white text-blue-600 shadow-lg' : 'text-white hover:bg-blue-700'
                            } transform hover:scale-105`}
                        onClick={() => setActiveMenu('requests')}
                    >
                        <PenTool size={22} className="flex-shrink-0" />
                        {isSidebarExpanded && (
                            <span className="ml-3 font-semibold whitespace-nowrap">คำขอซ่อมบำรุง</span>
                        )}
                    </div>
                    <div
                        className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 ${activeMenu === 'dashboard' ? 'bg-white text-blue-600 shadow-lg' : 'text-white hover:bg-blue-700'
                            } transform hover:scale-105`}
                        onClick={() => setActiveMenu('dashboard')}
                    >
                        <LayoutDashboard size={22} className="flex-shrink-0" />
                        {isSidebarExpanded && (
                            <span className="ml-3 font-semibold whitespace-nowrap">แดชบอร์ด</span>
                        )}
                    </div>
                    <div
                        className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 ${activeMenu === 'settings' ? 'bg-white text-blue-600 shadow-lg' : 'text-white hover:bg-blue-700'
                            } transform hover:scale-105`}
                        onClick={() => setActiveMenu('settings')}
                    >
                        <Cog size={22} className="flex-shrink-0" />
                        {isSidebarExpanded && (
                            <span className="ml-3 font-semibold whitespace-nowrap">การตั้งค่า</span>
                        )}
                    </div>
                </div>

                <div className="w-full px-2 pb-4">
                    <div
                        className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 ${activeMenu === 'logout' ? 'bg-red-100 text-red-600 shadow-lg' : 'text-white hover:bg-red-600'
                            } transform hover:scale-105`}
                        onClick={() => setActiveMenu('logout')}
                    >
                        <LogOut size={22} className="flex-shrink-0" />
                        {isSidebarExpanded && (
                            <span className="ml-3 font-semibold whitespace-nowrap">ออกจากระบบ</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-grow p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">ระบบจัดการคำขอซ่อมบำรุง</h2>
                    </div>
                    <button
                        onClick={() => {
                            setSelectedRequest(null);
                            setIsFormOpen(true);
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                        <Plus size={20} />
                        <span className="font-semibold">สร้างคำขอใหม่</span>
                    </button>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-lg mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-grow">
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500">
                                <Search size={20} />
                            </div>
                            <input
                                type="text"
                                className="w-full py-3 pl-12 pr-4 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-all duration-200 hover:bg-white"
                                placeholder="ค้นหาคำขอ..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            {['ทั้งหมด', 'คอมพิวเตอร์', 'สมาร์ทโฟน/แท็บเล็ต', 'เครื่องปรับอากาศ', 'อื่นๆ'].map(category => (
                                <button
                                    key={category}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${activeCategory === category
                                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-md'
                                        } transform hover:scale-105`}
                                    onClick={() => setActiveCategory(category)}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex border-b border-gray-200 mb-6">
                    <button
                        className={`px-6 py-3 font-semibold ${activeTab === 'requests' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'} transition-all duration-200`}
                        onClick={() => setActiveTab('requests')}
                    >
                        คำขอซ่อมบำรุง
                    </button>
                    <button
                        className={`px-6 py-3 font-semibold ${activeTab === 'invoices' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'} transition-all duration-200`}
                        onClick={() => setActiveTab('invoices')}
                    >
                        ใบแจ้งหนี้
                    </button>
                </div>

                {activeTab === 'requests' && (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="p-5 space-y-4">
                            {filteredRequests.length > 0 ? (
                                filteredRequests.map((request) => (
                                    <div
                                        key={request.id}
                                        className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-200 animate-fade-in"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center">
                                                <h4 className="text-lg font-semibold text-gray-800 truncate">
                                                    {request.request_no} - {request.customer_name} <span className="text-gray-500">({request.customer_phone})</span>
                                                </h4>
                                                <span
                                                    className={`ml-2 px-3 py-1 text-xs font-semibold rounded-full ${request.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : request.status === 'in_progress'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-green-100 text-green-800'
                                                        }`}
                                                >
                                                    {formatStatus(request.status)}
                                                </span>
                                            </div>
                                            <div className="flex gap-4 text-sm text-gray-500 mt-1">
                                                <span>วันที่: {request.created_at ? new Date(request.created_at).toLocaleDateString('th-TH') : '-'} </span>
                                                <span>ช่าง: {request.technician?.name || <span className="text-gray-400">ไม่มีช่าง</span>}</span>
                                                <span>หมวดหมู่: {request.category}</span>
                                                <span>รายละเอียด: {request.description}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => {
                                                    setSelectedRequest(request);
                                                    setIsFormOpen(true);
                                                }}
                                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transform hover:scale-110 transition-all duration-200"
                                                title="แก้ไขคำขอ"
                                            >
                                                <Edit size={20} />
                                            </button>
                                            <button
                                                onClick={() => deleteRequest(request.id)}
                                                className="p-2 text-red-600 hover:bg-red-100 rounded-xl transform hover:scale-110 transition-all duration-200"
                                                title="ลบคำขอ"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedRequest(request);
                                                    setIsInvoiceFormOpen(true);
                                                }}
                                                className="p-2 text-green-600 hover:bg-green-100 rounded-xl transform hover:scale-110 transition-all duration-200"
                                                title="สร้างใบแจ้งหนี้"
                                            >
                                                <ReceiptText size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-500 animate-fade-in">
                                    <ReceiptText size={40} className="mx-auto mb-3 text-gray-300" />
                                    <p className="text-base font-semibold">ไม่พบคำขอซ่อมบำรุง</p>
                                    <button
                                        onClick={() => {
                                            setSelectedRequest(null);
                                            setIsFormOpen(true);
                                        }}
                                        className="mt-3 text-blue-500 hover:text-blue-700 text-sm font-semibold transform hover:scale-105 transition-all duration-200"
                                    >
                                        + สร้างคำขอใหม่
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'invoices' && (
                    <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">
                        <div className="min-w-[1000px]">
                            <div className="grid grid-cols-14 bg-gradient-to-r from-blue-50 to-blue-100 p-4 border-b sticky top-0 z-10">
                                <div className="col-span-2 font-semibold text-gray-800">หมายเลขใบแจ้งหนี้</div>
                                <div className="col-span-2 font-semibold text-gray-800">วันที่ออก</div>
                                <div className="col-span-2 font-semibold text-gray-800">ลูกค้า</div>
                                <div className="col-span-2 font-semibold text-gray-800">เบอร์โทร</div>
                                <div className="col-span-2 font-semibold text-gray-800">จำนวนเงิน</div>
                                <div className="col-span-2 font-semibold text-gray-800 text-center">สถานะ</div>
                                <div className="col-span-2 font-semibold text-gray-800 text-right">จัดการ</div>
                            </div>

                            {filteredInvoices.length > 0 ? (
                                filteredInvoices.map((invoice) => {
                                    const req = requests.find(r => r.id === invoice.request_id);
                                    return (
                                        <div key={invoice.id} className="grid grid-cols-14 p-4 border-b hover:bg-blue-50/50 transition-all duration-200 animate-fade-in items-center">
                                            <div className="col-span-2 text-gray-700 font-medium truncate">{invoice.invoice_no}</div>
                                            <div className="col-span-2 text-gray-700">
                                                {new Date(invoice.issue_date).toLocaleDateString('th-TH')}
                                            </div>
                                            <div className="col-span-2 text-gray-700 truncate">
                                                {req ? req.customer_name : 'ไม่พบข้อมูล'}
                                            </div>
                                            <div className="col-span-2 text-gray-700 truncate">
                                                {req ? req.customer_phone : '-'}
                                            </div>
                                            <div className="col-span-2 text-gray-700 font-semibold">
                                                {invoice.amount.toLocaleString()} บาท
                                            </div>
                                            <div className="col-span-2 flex items-center justify-center gap-2">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                    invoice.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {invoice.status === 'paid' ? 'ชำระแล้ว' :
                                                        invoice.status === 'cancelled' ? 'ยกเลิก' :
                                                            'ยังไม่ชำระ'}
                                                </span>
                                            </div>
                                            <div className="col-span-2 flex items-center justify-end gap-2">
                                                <div className="flex gap-1">
                                                    {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                                                        <button
                                                            onClick={() => markInvoiceAsPaid(invoice.id)}
                                                            className="p-2 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transform hover:scale-110 transition-all duration-200"
                                                            title="เปลี่ยนเป็นชำระแล้ว"
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            const relatedRequest = requests.find(r => r.id === invoice.request_id);
                                                            if (!relatedRequest) {
                                                                showNotification('ไม่พบคำขอที่เกี่ยวข้องกับใบแจ้งหนี้นี้', 'error');
                                                                return;
                                                            }
                                                            if (!invoice) {
                                                                showNotification('ไม่พบข้อมูลใบแจ้งหนี้', 'error');
                                                                return;
                                                            }
                                                            setSelectedRequest(relatedRequest);
                                                            setSelectedInvoice(invoice);
                                                            setIsInvoiceFormOpen(true);
                                                        }}
                                                        className="p-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transform hover:scale-110 transition-all duration-200"
                                                        title="แก้ไขใบแจ้งหนี้"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteInvoice(invoice.id)}
                                                        className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transform hover:scale-110 transition-all duration-200"
                                                        title="ลบใบแจ้งหนี้"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => window.open(`/api/maintenance/invoices/${invoice.id}/print`, '_blank')}
                                                        className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transform hover:scale-110 transition-all duration-200"
                                                        title="พิมพ์ใบแจ้งหนี้"
                                                    >
                                                        <Printer size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-8 text-center text-gray-500 animate-fade-in">
                                    <FileText size={40} className="mx-auto mb-3 text-gray-300" />
                                    <p className="text-base font-semibold">ไม่พบใบแจ้งหนี้</p>
                                    <p className="text-sm text-gray-400 mt-1">เริ่มต้นด้วยการสร้างใบแจ้งหนี้จากคำขอซ่อมบำรุง</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {isFormOpen && (
                    <RequestForm
                        request={selectedRequest}
                        technicians={technicians}
                        onClose={() => setIsFormOpen(false)}
                        onSave={() => {
                            loadData();
                            setIsFormOpen(false);
                            showNotification(
                                selectedRequest ? 'แก้ไขคำขอสำเร็จ' : 'เพิ่มคำขอสำเร็จ',
                                'success'
                            );
                        }}
                    />
                )}
                {isInvoiceFormOpen && selectedRequest && (
                    <InvoiceForm
                        request={selectedRequest}
                        invoice={selectedInvoice}
                        onClose={() => {
                            setIsInvoiceFormOpen(false);
                            setSelectedInvoice(null);
                        }}
                        onSave={() => {
                            loadData();
                            loadInvoices();
                            setIsInvoiceFormOpen(false);
                            setSelectedInvoice(null);
                            showNotification(selectedInvoice ? 'แก้ไขใบแจ้งหนี้สำเร็จ' : 'สร้างใบแจ้งหนี้สำเร็จ', 'success');
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default MaintenanceRequestSystem;