import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Users, Calendar, Shield, Search, Plus, Trash2, 
  CheckCircle, XCircle, LogOut, Lock, Download, ChevronLeft, Award, Clock
} from 'lucide-react';

// إعداد اتصال Supabase بالمفاتيح الخاصة بك
const supabaseUrl = 'https://kenstwnoudkduzmpjthd.supabase.co';
const supabaseKey = 'sb_publishable_KuWD2MzHOBPChnQ9jgTjnA_WlNYKqXA';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [activeTab, setActiveTab] = useState('players');
  const [players, setPlayers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('all');
  
  // حالة نافذة إضافة لاعب جديد أو الإدارة
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [newPlayer, setNewPlayer] = useState({ name: '', position: 'هجوم', age: 12, pace: 80, skill: 85 });

  // جلب اللاعبين من قاعدة بيانات Supabase عند فتح التطبيق
  useEffect(() => {
    fetchPlayers();
  }, []);

  async function fetchPlayers() {
    const { data, error } = await supabase.from('players').select('*');
    if (error) {
      console.error('خطأ في جلب اللاعبين:', error);
    } else if (data) {
      setPlayers(data);
    }
  }

  // إضافة لاعب جديد إلى قاعدة البيانات
  async function handleAddPlayer(e) {
    e.preventDefault();
    if (!newPlayer.name) return;

    const { data, error } = await supabase
      .from('players')
      .insert([newPlayer])
      .select();

    if (error) {
      console.error('خطأ في إضافة اللاعب:', error);
    } else if (data) {
      setPlayers([...players, ...data]);
      setNewPlayer({ name: '', position: 'هجوم', age: 12, pace: 80, skill: 85 });
    }
  }

  // حذف لاعب من قاعدة البيانات
  async function handleDeletePlayer(id) {
    const { error } = await supabase.from('players').delete().eq('id', id);
    if (error) {
      console.error('خطأ في الحذف:', error);
    } else {
      setPlayers(players.filter(p => p.id !== id));
    }
  }

  // تسجيل دخول المدير
  function handleAdminLogin(e) {
    e.preventDefault();
    if (adminPassword === 'admin2026') {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminPassword('');
    } else {
      alert('كلمة المرور غير صحيحة');
    }
  }

  // تصفية اللاعبين حسب البحث والمركز
  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPosition = selectedPosition === 'all' || player.position === selectedPosition;
    return matchesSearch && matchesPosition;
  });

  return (
    <div dir="rtl" className="min-h-screen bg-[#0B132B] text-white font-sans pb-24">
      
      {/* شريط العنوان العلوي */}
      <header className="bg-[#1C2541] border-b border-[#3A506B] px-4 py-3 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FFD166] flex items-center justify-center text-[#0B132B] font-bold text-lg shadow-md">
            ⚽
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">أكاديمية الحملة الأردنية الهاشمية الرياضية للأيتام</h1>
            <p className="text-xs text-[#FFD166]">رعاية وتطوير المواهب</p>
          </div>
        </div>

        <div>
          {isAdmin ? (
            <button 
              onClick={() => setIsAdmin(false)}
              className="bg-red-500/20 text-red-400 border border-red-500/40 px-3 py-1 rounded-full text-xs flex items-center gap-1 font-semibold"
            >
              <LogOut size={14} /> خروج المدير
            </button>
          ) : (
            <button 
              onClick={() => setShowAdminLogin(true)}
              className="bg-[#FF9F1C] text-[#0B132B] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow"
            >
              <Lock size={14} /> الإدارة
            </button>
          )}
        </div>
      </header>

      {/* نافذة تسجيل دخول المدير */}
      <AnimatePresence>
        {showAdminLogin && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-[#1C2541] border border-[#3A506B] p-5 rounded-2xl w-full max-w-sm shadow-xl">
              <h3 className="text-lg font-bold text-[#FFD166] mb-3 text-center">دخول لوحة الإدارة</h3>
              <form onSubmit={handleAdminLogin}>
                <input 
                  type="password" 
                  placeholder="كلمة المرور (admin2026)" 
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-[#0B132B] border border-[#3A506B] rounded-xl px-3 py-2 text-white text-sm mb-4 focus:outline-none focus:border-[#FF9F1C]"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-[#FF9F1C] text-[#0B132B] font-bold py-2 rounded-xl text-sm">دخول</button>
                  <button type="button" onClick={() => setShowAdminLogin(false)} className="flex-1 bg-gray-600 text-white py-2 rounded-xl text-sm">إلغاء</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* المحتوى الرئيسي */}
      <main className="p-4 max-w-4xl mx-auto">
        
        {/* بطاقة ترحيبية / احتفال الفريق */}
        <div className="relative rounded-2xl overflow-hidden mb-6 shadow-xl border border-[#3A506B]">
          <div className="bg-gradient-to-t from-[#0B132B] via-transparent to-black/40 absolute inset-0 z-10"></div>
          <div className="w-full h-48 bg-[#1C2541] flex items-center justify-center text-[#FFD166] text-lg font-bold">
            🌟 احتفال الفريق والبطولات 🌟
          </div>
          <div className="absolute bottom-3 right-3 z-20 bg-[#0B132B]/80 backdrop-blur px-3 py-1 rounded-lg text-xs border border-[#3A506B]">
            {players.length} لاعباً مسجلاً سحابياً
          </div>
        </div>

        {/* نموذج إضافة لاعب جديد (يظهر فقط للمدير) */}
        {isAdmin && (
          <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-[#1C2541] border border-[#FF9F1C] p-4 rounded-2xl mb-6 shadow-lg">
            <h3 className="text-sm font-bold text-[#FFD166] mb-3 flex items-center gap-2">
              <Plus size={16} /> إضافة لاعب جديد للقاعدة السحابية
            </h3>
            <form onSubmit={handleAddPlayer} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input 
                type="text" 
                placeholder="اسم اللاعب الكامل" 
                value={newPlayer.name}
                onChange={(e) => setNewPlayer({...newPlayer, name: e.target.value})}
                className="bg-[#0B132B] border border-[#3A506B] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#FF9F1C]"
                required
              />
              <select 
                value={newPlayer.position}
                onChange={(e) => setNewPlayer({...newPlayer, position: e.target.value})}
                className="bg-[#0B132B] border border-[#3A506B] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#FF9F1C]"
              >
                <option value="هجوم">هجوم</option>
                <option value="وسط">وسط</option>
                <option value="دفاع">دفاع</option>
                <option value="حارس">حارس</option>
              </select>
              <input 
                type="number" 
                placeholder="العمر" 
                value={newPlayer.age}
                onChange={(e) => setNewPlayer({...newPlayer, age: Number(e.target.value)})}
                className="bg-[#0B132
