import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy, Users, Calendar, Search, Plus, Trash2,
  LogOut, Lock, Award, X, RefreshCw, UserCircle,
  Settings, Bell, Image, Upload, Pencil, Save,
  ChevronLeft, ChevronRight, Home, Clock, MapPin,
  Smartphone, Shield, FileText, Download, UploadCloud,
  Eye, ArrowRight, User, Database, Palette,
  RotateCcw, Type, SlidersHorizontal
} from 'lucide-react';

// إعداد الاتصال بـ Supabase عبر متغيرات Vercel
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'إعدادات Supabase غير موجودة. تحقق من متغيرات البيئة في Vercel.'
  );
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

const ADMIN_UID = 'd3ce2ae4-6736-4782-ae55-5f9359effd8a';

const defaultTheme = {
  navy: '#0b132b',
  navyLight: '#172442',
  gold: '#d9ad55',
  white: '#ffffff',
  orange: '#f28c28',
  muted: '#aab4c8',
  card: '#14213d',
  fontFamily: 'Cairo',
  cardRadius: 17,
  cardShadow: true
};

const initialSettings = {
  logo: '/assets/logo.jpg',
  playerOfWeek: '/assets/player-of-week.jpg',
  slides: [
    {
      image: '/assets/team-celebration.jpg',
      title: 'نصنع الأبطال ونرعى المواهب',
      subtitle: 'بيئة رياضية تربوية تهدف إلى تطوير المواهب وبناء جيل متميز.'
    },
    {
      image: '/assets/team-photo.jpg',
      title: 'معًا نحو المستقبل',
      subtitle: 'بالعمل الجماعي والإصرار نصنع النجاح.'
    }
  ],
  imageHeight: 360,
  playerImageHeight: 210,
  playerOfWeekName: 'نجم الأكاديمية',
  playerOfWeekDescription: 'تكريم المواهب والتميز الرياضي.',
  theme: { ...defaultTheme }
};

const cardStyle = {
  background: 'var(--card)',
  color: 'var(--text)',
  borderRadius: 'var(--card-radius)',
  padding: 18,
  boxShadow: 'var(--card-shadow)',
  border: '1px solid var(--border)'
};

const inputStyle = {
  width: '100%',
  padding: 12,
  borderRadius: 9,
  border: '1px solid #ddd',
  marginBottom: 12,
  fontSize: 15,
  boxSizing: 'border-box',
  fontFamily: 'inherit'
};

const primaryButton = {
  border: 0,
  borderRadius: 9,
  padding: '11px 16px',
  background: 'var(--primary)',
  color: '#fff',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 7,
  fontFamily: 'inherit'
};

const goldButton = {
  ...primaryButton,
  background: 'var(--gold)',
  color: 'var(--primary)',
  fontWeight: 800
};

const modalBackdrop = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(4,10,25,.78)',
  backdropFilter: 'blur(5px)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 15
};

const themeLabels = {
  navy: 'اللون الأساسي',
  navyLight: 'اللون الثانوي',
  gold: 'اللون الذهبي',
  orange: 'اللون البرتقالي',
  white: 'لون النص الفاتح',
  muted: 'لون النص الثانوي',
  card: 'لون البطاقات'
};

const fontOptions = [
  { value: 'Cairo', label: 'Cairo - القاهرة' },
  { value: 'Tajawal', label: 'Tajawal - تجوال' },
  { value: 'Almarai', label: 'Almarai - المراعي' }
];

function normalizeTheme(theme) {
  const merged = { ...defaultTheme, ...(theme || {}) };

  Object.keys(themeLabels).forEach(key => {
    if (!/^#[0-9a-fA-F]{6}$/.test(merged[key])) {
      merged[key] = defaultTheme[key];
    }
  });

  if (!fontOptions.some(font => font.value === merged.fontFamily)) {
    merged.fontFamily = 'Cairo';
  }

  merged.cardRadius = Math.min(
    30,
    Math.max(5, Number(merged.cardRadius) || 17)
  );

  merged.cardShadow = merged.cardShadow !== false;

  return merged;
}

export default function App() {
  const [players, setPlayers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState(initialSettings);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isAdmin, setIsAdmin] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);

  const [authStep, setAuthStep] = useState('');
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinLoading, setPinLoading] = useState(false);

  const [showLogin, setShowLogin] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  // كلمة المرور المستخدمة في استعادة الحساب
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // حالات مستقلة لتغيير كلمة المرور من لوحة التحكم
  const [settingsNewPassword, setSettingsNewPassword] = useState('');
  const [settingsConfirmPassword, setSettingsConfirmPassword] = useState('');

  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [activeTab, setActiveTab] = useState('home');
  const [search, setSearch] = useState('');
  const [position, setPosition] = useState('الكل');
  const [slideIndex, setSlideIndex] = useState(0);
  const [installPrompt, setInstallPrompt] = useState(null);

  const [editingPlayer, setEditingPlayer] = useState(null);
  const [extraFields, setExtraFields] = useState([]);

  const [playerForm, setPlayerForm] = useState({
    name: '',
    position: 'هجوم',
    age: '',
    pace: 80,
    skill: 85,
    photo: ''
  });

  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    session_date: '',
    start_time: '',
    end_time: '',
    location: '',
    notes: ''
  });

  const [notificationForm, setNotificationForm] = useState({
    title: '',
    body: '',
    is_published: true
  });

  // تطبيق إعدادات المظهر
  useEffect(() => {
    const theme = normalizeTheme(settings.theme);
    const root = document.documentElement;

    root.style.setProperty('--primary', theme.navy);
    root.style.setProperty('--navy', theme.navy);
    root.style.setProperty('--navy-light', theme.navyLight);
    root.style.setProperty('--gold', theme.gold);
    root.style.setProperty('--orange', theme.orange);
    root.style.setProperty('--white', theme.white);
    root.style.setProperty('--muted', theme.muted);
    root.style.setProperty('--card', theme.card);
    root.style.setProperty('--text', theme.white);
    root.style.setProperty('--card-radius', `${theme.cardRadius}px`);

    root.style.setProperty(
      '--card-shadow',
      theme.cardShadow ? '0 8px 25px rgba(0,0,0,.16)' : 'none'
    );

    root.style.setProperty(
      '--font-family',
      `'${theme.fontFamily}', sans-serif`
    );
  }, [settings.theme]);

  // التحقق من جلسة الإدارة عند فتح الموقع
  useEffect(() => {
    let mounted = true;

    loadAll();

    async function prepareAdminGate(session) {
      const admin = session?.user?.id === ADMIN_UID;

      if (!admin) {
        if (mounted) {
          setIsAdmin(false);
          setHasEntered(false);
          setAuthStep('');
        }
        return;
      }

      if (mounted) {
        setIsAdmin(true);
        setHasEntered(false);
      }

      const { data, error } = await supabase.rpc('has_admin_pin');

      if (!mounted) return;

      if (error) {
        setAuthStep('');
        alert('تعذر التحقق من إعدادات PIN: ' + error.message);
        return;
      }

      setAuthStep(data === true ? 'verify' : 'setup');
    }

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error(error);
        return;
      }

      prepareAdminGate(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsAdmin(true);
          setHasEntered(false);
          setAuthStep('');
          setShowLogin(false);
          setShowForgotPassword(false);
          setShowResetPassword(true);
          return;
        }

        const admin = session?.user?.id === ADMIN_UID;

        if (event === 'SIGNED_OUT' || !admin) {
          setIsAdmin(false);
          setHasEntered(false);
          setAuthStep('');
          setPin('');
        } else if (event === 'SIGNED_IN') {
          setIsAdmin(true);
          setHasEntered(false);
        }
      }
    );

    const installHandler = event => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', installHandler);

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
      window.removeEventListener('beforeinstallprompt', installHandler);
    };
  }, []);

  // تغيير الشرائح تلقائيًا
  useEffect(() => {
    if (settings.slides?.length > 1) {
      const timer = setInterval(() => {
        setSlideIndex(index => (index + 1) % settings.slides.length);
      }, 6000);

      return () => clearInterval(timer);
    }
  }, [settings.slides]);

  async function loadAll() {
    setLoading(true);
    setError('');

    try {
      const results = await Promise.all([
        supabase.from('players').select('*').order('name'),
        supabase.from('training_sessions').select('*').order('session_date'),
        supabase.from('academy_notifications')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false }),
        supabase.from('academy_settings')
          .select('*')
          .eq('id', 'main')
          .maybeSingle()
      ]);

      if (results[0].error) {
        setError(results[0].error.message);
      } else {
        setPlayers(results[0].data || []);
      }

      if (!results[1].error) setSessions(results[1].data || []);
      if (!results[2].error) setNotifications(results[2].data || []);

      if (results[3].data?.content) {
        const saved = results[3].data.content;

        setSettings({
          ...initialSettings,
          ...saved,
          theme: normalizeTheme(saved.theme)
        });
      }
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء تحميل البيانات.');
    }

    setLoading(false);
  }

  // الدخول كزائر
  async function enterAsVisitor() {
    if (isAdmin) {
      await supabase.auth.signOut();
    }

    setIsAdmin(false);
    setHasEntered(true);
    setAuthStep('');
    setPin('');
  }

  // تسجيل دخول الإدارة
  async function login(e) {
    e.preventDefault();
    setPinLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user?.id !== ADMIN_UID) {
        await supabase.auth.signOut();
        alert('هذا الحساب غير مخوّل لدخول لوحة الإدارة.');
        return;
      }

      setIsAdmin(true);
      setHasEntered(false);
      setShowLogin(false);

      setEmail('');
      setPassword('');

      const { data: pinExists, error: pinError } =
        await supabase.rpc('has_admin_pin');

      if (pinError) throw pinError;

      setAuthStep(pinExists === true ? 'verify' : 'setup');
    } catch (err) {
      alert('تعذر تسجيل الدخول: ' + err.message);
    } finally {
      setPinLoading(false);
    }
  }

  // التحقق من PIN
  async function verifyPin(e) {
    e.preventDefault();

    if (!/^\d{4}$/.test(pin)) {
      alert('يجب إدخال رمز PIN مكون من أربعة أرقام.');
      return;
    }

    setPinLoading(true);

    try {
      const { data, error } = await supabase.rpc('verify_admin_pin', {
        p_pin: pin
      });

      if (error) throw error;

      if (data !== true) {
        alert('رمز PIN غير صحيح أو تم قفل المحاولة مؤقتًا.');
        setPin('');
        return;
      }

      setHasEntered(true);
      setIsAdmin(true);
      setAuthStep('');
      setPin('');

      alert('تم التحقق بنجاح.');
    } catch (err) {
      alert('تعذر التحقق من PIN: ' + err.message);
    } finally {
      setPinLoading(false);
    }
  }

  // إعداد PIN لأول مرة
  async function setupPin(e) {
    e.preventDefault();

    if (!/^\d{4}$/.test(newPin)) {
      alert('يجب أن يتكون PIN من أربعة أرقام.');
      return;
    }

    if (newPin !== confirmPin) {
      alert('رمزا PIN غير متطابقين.');
      return;
    }

    setPinLoading(true);

    try {
      const { error } = await supabase.rpc('set_admin_pin', {
        p_pin: newPin
      });

      if (error) throw error;

      setHasEntered(true);
      setIsAdmin(true);
      setAuthStep('');
      setNewPin('');
      setConfirmPin('');

      alert('تم إعداد رمز PIN بنجاح.');
    } catch (err) {
      alert('تعذر إعداد PIN: ' + err.message);
    } finally {
      setPinLoading(false);
    }
  }

  // تغيير PIN من الإعدادات
  async function changeAdminPin(e) {
    e.preventDefault();

    if (!/^\d{4}$/.test(newPin)) {
      alert('يجب أن يتكون PIN من أربعة أرقام.');
      return;
    }

    if (newPin !== confirmPin) {
      alert('رمزا PIN غير متطابقين.');
      return;
    }

    setPinLoading(true);

    try {
      const { error } = await supabase.rpc('set_admin_pin', {
        p_pin: newPin
      });

      if (error) throw error;

      setNewPin('');
      setConfirmPin('');

      alert('تم تغيير رمز PIN بنجاح.');
    } catch (err) {
      alert('تعذر تغيير PIN: ' + err.message);
    } finally {
      setPinLoading(false);
    }
  }

  // طلب استعادة كلمة المرور
  async function sendPasswordReset(e) {
    e.preventDefault();

    if (!email.trim()) {
      alert('يرجى إدخال البريد الإلكتروني.');
      return;
    }

    setPinLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });

      if (error) throw error;

      alert('تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني.');
      setShowForgotPassword(false);
    } catch (err) {
      alert('تعذر إرسال رابط الاستعادة: ' + err.message);
    } finally {
      setPinLoading(false);
    }
  }

  // تعيين كلمة مرور جديدة عبر رابط الاستعادة
  async function updateAdminPassword(e) {
    e.preventDefault();

    if (newPassword.length < 8) {
      alert('يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      alert('كلمتا المرور غير متطابقتين.');
      return;
    }

    setPinLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      await supabase.auth.signOut();

      setIsAdmin(false);
      setHasEntered(false);
      setAuthStep('');
      setShowResetPassword(false);
      setNewPassword('');
      setConfirmNewPassword('');

      alert('تم تغيير كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.');
    } catch (err) {
      alert('تعذر تغيير كلمة المرور: ' + err.message);
    } finally {
      setPinLoading(false);
    }
  }

  // تغيير كلمة مرور الإدارة من لوحة التحكم
  async function changeAdminPassword(e) {
    e.preventDefault();

    if (!isAdmin || !hasEntered) {
      alert('يجب تسجيل الدخول إلى الإدارة أولاً.');
      return;
    }

    if (settingsNewPassword.length < 8) {
      alert('يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.');
      return;
    }

    if (settingsNewPassword !== settingsConfirmPassword) {
      alert('كلمتا المرور غير متطابقتين.');
      return;
    }

    setPinLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: settingsNewPassword
      });

      if (error) throw error;

      setSettingsNewPassword('');
      setSettingsConfirmPassword('');

      alert('تم تغيير كلمة مرور الإدارة بنجاح.');
    } catch (err) {
      alert('تعذر تغيير كلمة المرور: ' + err.message);
    } finally {
      setPinLoading(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();

    setIsAdmin(false);
    setHasEntered(false);
    setAuthStep('');
    setPin('');
    setNewPin('');
    setConfirmPin('');
    setSettingsNewPassword('');
    setSettingsConfirmPassword('');
    setActiveTab('home');
  }

  // رفع الصور
  async function uploadImage(file) {
    if (!file) return null;

    if (!['image/jpeg', 'image/jpg'].includes(file.type)) {
      alert('يرجى اختيار صورة بصيغة JPG فقط.');
      return null;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة يجب ألا يتجاوز 5 ميجابايت.');
      return null;
    }

    const fileName =
      `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;

    const { error } = await supabase.storage
      .from('academy-media')
      .upload(fileName, file, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (error) {
      alert('تعذر رفع الصورة: ' + error.message);
      return null;
    }

    const { data } = supabase.storage
      .from('academy-media')
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  async function saveSettings(updatedSettings) {
    if (!isAdmin || !hasEntered) return false;

    const safeSettings = {
      ...updatedSettings,
      theme: normalizeTheme(updatedSettings.theme)
    };

    const { error } = await supabase
      .from('academy_settings')
      .upsert({
        id: 'main',
        content: safeSettings,
        updated_at: new Date().toISOString()
      });

    if (error) {
      alert('تعذر حفظ الإعدادات: ' + error.message);
      return false;
    }

    setSettings(safeSettings);
    alert('تم حفظ إعدادات الموقع بنجاح');
    return true;
  }

  function updateTheme(key, value) {
    setSettings(old => ({
      ...old,
      theme: {
        ...normalizeTheme(old.theme),
        [key]: value
      }
    }));
  }

  function resetTheme() {
    if (!window.confirm('هل تريد إعادة ألوان وخطوط الموقع إلى الوضع الافتراضي؟')) {
      return;
    }

    setSettings(old => ({
      ...old,
      theme: { ...defaultTheme }
    }));
  }

  function openNewPlayer() {
    if (!isAdmin) return;

    setEditingPlayer(null);
    setExtraFields([]);

    setPlayerForm({
      name: '',
      position: 'هجوم',
      age: '',
      pace: 80,
      skill: 85,
      photo: ''
    });

    setShowPlayerForm(true);
  }

  function openEditPlayer(player) {
    if (!isAdmin) return;

    setEditingPlayer(player);

    setExtraFields(
      Object.entries(player.extra_data || {}).map(([key, value]) => ({
        key,
        value: String(value)
      }))
    );

    setPlayerForm({
      name: player.name || '',
      position: player.position || 'هجوم',
      age: player.age || '',
      pace: player.pace ?? 80,
      skill: player.skill ?? 85,
      photo: player.photo || ''
    });

    setShowPlayerForm(true);
  }

  async function savePlayer(e) {
    e.preventDefault();
    if (!isAdmin) return;

    if (!playerForm.name.trim()) {
      alert('يرجى كتابة اسم اللاعب');
      return;
    }

    const extraData = {};

    extraFields.forEach(field => {
      if (field.key.trim()) {
        extraData[field.key.trim()] = field.value;
      }
    });

    const playerData = {
      name: playerForm.name.trim(),
      position: playerForm.position,
      age: playerForm.age ? Number(playerForm.age) : null,
      pace: Number(playerForm.pace),
      skill: Number(playerForm.skill),
      photo: playerForm.photo || null,
      extra_data: extraData
    };

    let result;

    if (editingPlayer) {
      result = await supabase
        .from('players')
        .update(playerData)
        .eq('id', editingPlayer.id)
        .select();
    } else {
      result = await supabase
        .from('players')
        .insert([playerData])
        .select();
    }

    if (result.error) {
      alert('تعذر حفظ اللاعب: ' + result.error.message);
      return;
    }

    await loadAll();
    setShowPlayerForm(false);

    alert(editingPlayer ? 'تم تعديل بيانات اللاعب' : 'تمت إضافة اللاعب بنجاح');
  }

  async function deletePlayer(id) {
    if (!isAdmin) return;
    if (!window.confirm('هل تريد حذف هذا اللاعب؟')) return;

    const { error } = await supabase.from('players').delete().eq('id', id);

    if (error) {
      alert('تعذر الحذف: ' + error.message);
      return;
    }

    setPlayers(old => old.filter(player => player.id !== id));
    setSelectedPlayer(null);
  }

  async function saveSchedule(e) {
    e.preventDefault();
    if (!isAdmin) return;

    const { error } = await supabase
      .from('training_sessions')
      .insert([scheduleForm]);

    if (error) {
      alert('تعذر حفظ الموعد: ' + error.message);
      return;
    }

    setShowScheduleForm(false);

    setScheduleForm({
      title: '',
      session_date: '',
      start_time: '',
      end_time: '',
      location: '',
      notes: ''
    });

    await loadAll();
    alert('تمت إضافة الموعد');
  }

  async function deleteSchedule(id) {
    if (!isAdmin) return;
    if (!window.confirm('هل تريد حذف هذا الموعد؟')) return;

    const { error } = await supabase
      .from('training_sessions')
      .delete()
      .eq('id', id);

    if (error) {
      alert('تعذر حذف الموعد: ' + error.message);
      return;
    }

    setSessions(old => old.filter(item => item.id !== id));
  }

  async function saveNotification(e) {
    e.preventDefault();
    if (!isAdmin) return;

    const { error } = await supabase
      .from('academy_notifications')
      .insert([notificationForm]);

    if (error) {
      alert('تعذر نشر الإشعار: ' + error.message);
      return;
    }

    setShowNotificationForm(false);

    setNotificationForm({
      title: '',
      body: '',
      is_published: true
    });

    await loadAll();
    alert('تم حفظ الإشعار');
  }

  async function deleteNotification(id) {
    if (!isAdmin) return;
    if (!window.confirm('هل تريد حذف هذا الإشعار؟')) return;

    const { error } = await supabase
      .from('academy_notifications')
      .delete()
      .eq('id', id);

    if (error) {
      alert('تعذر حذف الإشعار: ' + error.message);
      return;
    }

    setNotifications(old => old.filter(item => item.id !== id));
  }

  async function changeSettingImage(field, file) {
    if (!isAdmin) return;

    const url = await uploadImage(file);
    if (!url) return;

    await saveSettings({
      ...settings,
      [field]: url
    });
  }

  async function changePlayerImage(file) {
    const url = await uploadImage(file);

    if (url) {
      setPlayerForm(old => ({
        ...old,
        photo: url
      }));
    }
  }

  async function changeSlideImage(index, file) {
    if (!isAdmin) return;

    const url = await uploadImage(file);
    if (!url) return;

    const slides = settings.slides.map((slide, i) =>
      i === index ? { ...slide, image: url } : slide
    );

    await saveSettings({
      ...settings,
      slides
    });
  }

  async function installApp() {
    if (!installPrompt) {
      alert('افتح قائمة المتصفح واختر إضافة إلى الشاشة الرئيسية.');
      return;
    }

    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  async function exportBackup() {
    if (!isAdmin) return;

    const backup = {
      app: 'academy-football',
      version: 1,
      createdAt: new Date().toISOString(),
      players,
      sessions,
      notifications,
      settings
    };

    const blob = new Blob(
      [JSON.stringify(backup, null, 2)],
      { type: 'application/json' }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `academy-backup-${new Date().toISOString().slice(0, 10)}.json`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    alert('تم تنزيل نسخة احتياطية من بيانات الأكاديمية.');
  }

  async function importBackup(file) {
    if (!isAdmin || !file) return;

    if (!window.confirm(
      'سيتم دمج بيانات النسخة الاحتياطية مع البيانات الحالية. لن يتم حذف السجلات الموجودة. هل تريد المتابعة؟'
    )) {
      return;
    }

    try {
      const text = await file.text();
      const backup = JSON.parse(text);

      if (
        backup.app !== 'academy-football' ||
        backup.version !== 1
      ) {
        alert('ملف النسخة الاحتياطية غير صالح أو غير مدعوم.');
        return;
      }

      if (
        !Array.isArray(backup.players) ||
        !Array.isArray(backup.sessions) ||
        !Array.isArray(backup.notifications) ||
        !backup.settings ||
        typeof backup.settings !== 'object'
      ) {
        alert('بيانات الملف غير مكتملة.');
        return;
      }

      if (backup.players.length) {
        const { error } = await supabase
          .from('players')
          .upsert(backup.players, { onConflict: 'id' });

        if (error) throw error;
      }

      if (backup.sessions.length) {
        const { error } = await supabase
          .from('training_sessions')
          .upsert(backup.sessions, { onConflict: 'id' });

        if (error) throw error;
      }

      if (backup.notifications.length) {
        const { error } = await supabase
          .from('academy_notifications')
          .upsert(backup.notifications, { onConflict: 'id' });

        if (error) throw error;
      }

      const restoredSettings = {
        ...initialSettings,
        ...backup.settings,
        theme: normalizeTheme(backup.settings.theme)
      };

      const { error: settingsError } = await supabase
        .from('academy_settings')
        .upsert({
          id: 'main',
          content: restoredSettings,
          updated_at: new Date().toISOString()
        });

      if (settingsError) throw settingsError;

      setSettings(restoredSettings);
      await loadAll();

      alert('تم استيراد النسخة الاحتياطية بنجاح.');
    } catch (err) {
      alert('تعذر استيراد النسخة الاحتياطية: ' + err.message);
    }
  }

  const filteredPlayers = players.filter(player => {
    const matchesName = (player.name || '')
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesPosition =
      position === 'الكل' || player.position === position;

    return matchesName && matchesPosition;
  });

  const currentSlide =
    settings.slides?.[slideIndex] || settings.slides?.[0];

  const tabs = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'players', label: 'اللاعبون', icon: Users },
    { id: 'schedule', label: 'المواعيد', icon: Calendar },
    { id: 'honor', label: 'لاعب الأسبوع', icon: Trophy }
  ];

  // شاشة البداية وتسجيل الدخول والتحقق
  if (!hasEntered) {
    return (
      <div className="academy" dir="rtl">
        <div className="welcome-screen">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .7 }}
            className="welcome-card"
          >
            <motion.img
              initial={{ scale: .8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: .2 }}
              src={settings.logo}
              alt="شعار الأكاديمية"
              className="welcome-logo"
            />

            <div className="welcome-tag">أهلاً وسهلاً بكم</div>

            <h1>
              أكاديمية الحملة الأردنية الهاشمية الرياضية للأيتام
            </h1>

            <p>رعاية المواهب وصناعة الأبطال</p>

            {!isAdmin && (
              <div className="welcome-buttons">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: .97 }}
                  onClick={enterAsVisitor}
                  style={{ ...goldButton, padding: 16, fontSize: 17 }}
                >
                  <Eye size={21} />
                  الدخول كزائر
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: .97 }}
                  onClick={() => setShowLogin(true)}
                  style={{
                    ...primaryButton,
                    background: 'transparent',
                    border: '1px solid var(--gold)',
                    padding: 15,
                    fontSize: 16
                  }}
                >
                  <Shield size={20} />
                  دخول الإدارة
                </motion.button>
              </div>
            )}

            {isAdmin && authStep === 'verify' && (
              <p>يرجى إدخال رمز PIN للمتابعة إلى لوحة الإدارة.</p>
            )}

            {isAdmin && authStep === 'setup' && (
              <p>هذه أول مرة تدخل فيها الإدارة. أنشئ رمز PIN لحماية حسابك.</p>
            )}

            <small>معًا نصنع المستقبل</small>
          </motion.div>
        </div>

        {/* تسجيل دخول الإدارة */}
        <AnimatePresence>
          {showLogin && (
            <div style={modalBackdrop}>
              <motion.form
                className="modal"
                onSubmit={login}
                initial={{ scale: .9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: .9, opacity: 0 }}
                style={{ width: '100%', maxWidth: 420, position: 'relative' }}
              >
                <button
                  type="button"
                  className="close-btn"
                  onClick={() => setShowLogin(false)}
                >
                  <X />
                </button>

                <Lock size={35} style={{ color: 'var(--gold)' }} />
                <h2>دخول الإدارة</h2>

                <input
                  style={inputStyle}
                  type="email"
                  placeholder="البريد الإلكتروني"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />

                <input
                  style={inputStyle}
                  type="password"
                  placeholder="كلمة المرور"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  onClick={() => {
                    setShowLogin(false);
                    setShowForgotPassword(true);
                  }}
                  style={{
                    background: 'transparent',
                    border: 0,
                    color: 'var(--gold)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    marginBottom: 12
                  }}
                >
                  نسيت كلمة المرور؟
                </button>

                <button
                  type="submit"
                  className="submit-btn"
                  style={{ width: '100%' }}
                  disabled={pinLoading}
                >
                  {pinLoading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
                </button>
              </motion.form>
            </div>
          )}
        </AnimatePresence>

        {/* إعداد أو التحقق من PIN */}
        <AnimatePresence>
          {isAdmin && !hasEntered &&
            (authStep === 'setup' || authStep === 'verify') && (
            <div style={modalBackdrop}>
              <motion.form
                className="modal"
                onSubmit={authStep === 'setup' ? setupPin : verifyPin}
                initial={{ scale: .9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: .9, opacity: 0 }}
                style={{ width: '100%', maxWidth: 420 }}
              >
                <Lock size={38} style={{ color: 'var(--gold)' }} />

                <h2>
                  {authStep === 'setup' ? 'إعداد رمز PIN' : 'التحقق من رمز PIN'}
                </h2>

                <p>
                  {authStep === 'setup'
                    ? 'أنشئ رمزًا سريًا مكونًا من أربعة أرقام لحماية لوحة الإدارة.'
                    : 'أدخل رمز PIN الخاص بك للمتابعة إلى لوحة الإدارة.'}
                </p>

                {authStep === 'setup' ? (
                  <>
                    <input
                      style={inputStyle}
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]{4}"
                      maxLength={4}
                      placeholder="رمز PIN الجديد"
                      value={newPin}
                      onChange={e =>
                        setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))
                      }
                      required
                    />

                    <input
                      style={inputStyle}
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]{4}"
                      maxLength={4}
                      placeholder="تأكيد رمز PIN"
                      value={confirmPin}
                      onChange={e =>
                        setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))
                      }
                      required
                    />
                  </>
                ) : (
                  <input
                    style={{
                      ...inputStyle,
                      textAlign: 'center',
                      letterSpacing: 12,
                      fontSize: 24
                    }}
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]{4}"
                    maxLength={4}
                    placeholder="••••"
                    value={pin}
                    onChange={e =>
                      setPin(e.target.value.replace(/\D/g, '').slice(0, 4))
                    }
                    required
                  />
                )}

                <button
                  type="submit"
                  className="submit-btn"
                  style={{ width: '100%' }}
                  disabled={pinLoading}
                >
                  {pinLoading
                    ? 'يرجى الانتظار...'
                    : authStep === 'setup'
                      ? 'حفظ رمز PIN'
                      : 'تحقق ودخول'}
                </button>

                <button
                  type="button"
                  style={{ ...primaryButton, width: '100%', marginTop: 10 }}
                  onClick={logout}
                >
                  إلغاء وتسجيل الخروج
                </button>
              </motion.form>
            </div>
          )}
        </AnimatePresence>

        {/* استعادة كلمة المرور */}
        <AnimatePresence>
          {showForgotPassword && (
            <div style={modalBackdrop}>
              <motion.form
                className="modal"
                onSubmit={sendPasswordReset}
                initial={{ opacity: 0, scale: .9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: .9 }}
                style={{ width: '100%', maxWidth: 420 }}
              >
                <button
                  type="button"
                  className="close-btn"
                  onClick={() => setShowForgotPassword(false)}
                >
                  <X />
                </button>

                <Lock size={35} style={{ color: 'var(--gold)' }} />
                <h2>استعادة كلمة المرور</h2>

                <p>أدخل بريد الإدارة لإرسال رابط إعادة تعيين كلمة المرور.</p>

                <input
                  style={inputStyle}
                  type="email"
                  placeholder="البريد الإلكتروني"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />

                <button
                  type="submit"
                  className="submit-btn"
                  style={{ width: '100%' }}
                  disabled={pinLoading}
                >
                  {pinLoading ? 'جارٍ الإرسال...' : 'إرسال رابط الاستعادة'}
                </button>
              </motion.form>
            </div>
          )}
        </AnimatePresence>

        {/* تعيين كلمة مرور جديدة */}
        <AnimatePresence>
          {showResetPassword && (
            <div style={modalBackdrop}>
              <motion.form
                className="modal"
                onSubmit={updateAdminPassword}
                initial={{ opacity: 0, scale: .9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: .9 }}
                style={{ width: '100%', maxWidth: 420 }}
              >
                <Lock size={35} style={{ color: 'var(--gold)' }} />

                <h2>تعيين كلمة مرور جديدة</h2>

                <input
                  style={inputStyle}
                  type="password"
                  placeholder="كلمة المرور الجديدة"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  minLength={8}
                  required
                />

                <input
                  style={inputStyle}
                  type="password"
                  placeholder="تأكيد كلمة المرور"
                  value={confirmNewPassword}
                  onChange={e => setConfirmNewPassword(e.target.value)}
                  minLength={8}
                  required
                />

                <button
                  type="submit"
                  className="submit-btn"
                  style={{ width: '100%' }}
                  disabled={pinLoading}
                >
                  {pinLoading ? 'جارٍ الحفظ...' : 'حفظ كلمة المرور الجديدة'}
                </button>
              </motion.form>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="academy" dir="rtl">
      <header className="topbar">
        <div className="brand">
          <img src={settings.logo} alt="شعار الأكاديمية" />
          <div>
            <h1>أكاديمية الحملة الأردنية الهاشمية الرياضية للأيتام</h1>
            <p>رعاية المواهب وصناعة الأبطال</p>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="admin-btn"
            onClick={() => setShowNotifications(true)}
            title="الإشعارات"
          >
            <Bell size={19} />
            {notifications.length > 0 && <span>{notifications.length}</span>}
          </button>

          {isAdmin ? (
            <>
              <button className="admin-btn" onClick={() => setShowSettings(true)}>
                <Settings size={17} />
                لوحة التحكم
              </button>

              <button className="logout-btn" onClick={logout}>
                <LogOut size={17} />
                خروج
              </button>
            </>
          ) : (
            <button className="admin-btn" onClick={() => setHasEntered(false)}>
              <ArrowRight size={17} />
              شاشة البداية
            </button>
          )}
        </div>
      </header>

      <main className="container">
        {activeTab === 'home' && (
          <section className="hero" style={{ position: 'relative', overflow: 'hidden' }}>
            {currentSlide?.image && (
              <img
                src={currentSlide.image}
                alt="صورة الأكاديمية"
                style={{
                  width: '100%',
                  height: `${settings.imageHeight || 360}px`,
                  objectFit: 'cover'
                }}
              />
            )}

            <div className="hero-overlay">
              <span className="hero-tag">معًا نحو المستقبل</span>
              <h2>{currentSlide?.title || 'نصنع الأبطال ونرعى المواهب'}</h2>
              <p>{currentSlide?.subtitle || 'رعاية المواهب وبناء جيل متميز.'}</p>

              <div className="hero-stats">
                <div>
                  <Users size={22} />
                  <strong>{players.length}</strong>
                  <span>لاعب مسجل</span>
                </div>
                <div>
                  <Trophy size={22} />
                  <strong>الأبطال</strong>
                  <span>روح الفريق</span>
                </div>
              </div>
            </div>

            {settings.slides?.length > 1 && (
              <>
                <button
                  onClick={() => setSlideIndex(
                    (slideIndex - 1 + settings.slides.length) % settings.slides.length
                  )}
                  className="slide-arrow slide-next"
                >
                  <ChevronRight />
                </button>

                <button
                  onClick={() => setSlideIndex(
                    (slideIndex + 1) % settings.slides.length
                  )}
                  className="slide-arrow slide-prev"
                >
                  <ChevronLeft />
                </button>
              </>
            )}
          </section>
        )}

        <nav className="tabs">
          {tabs.map(tab => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                className={activeTab === tab.id ? 'active' : ''}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.section
              key="home"
              className="section"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="section-heading">
                <div>
                  <h2>مرحبًا بكم في الأكاديمية</h2>
                  <p>مساحة رياضية لتطوير المواهب وصناعة المستقبل.</p>
                </div>
              </div>

              <div className="stats-grid">
                <div style={cardStyle}>
                  <Users size={30} />
                  <h3>{players.length}</h3>
                  <p>لاعب في الأكاديمية</p>
                </div>

                <div style={cardStyle}>
                  <Calendar size={30} />
                  <h3>{sessions.length}</h3>
                  <p>موعد تدريبي أو مباراة</p>
                </div>

                <div style={cardStyle}>
                  <Bell size={30} />
                  <h3>{notifications.length}</h3>
                  <p>إشعار منشور</p>
                </div>
              </div>
            </motion.section>
          )}

          {activeTab === 'players' && (
            <motion.section
              key="players"
              className="section"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="section-heading">
                <div>
                  <h2>نجوم الأكاديمية</h2>
                  <p>تعرف على لاعبي الأكاديمية ومواهبهم</p>
                </div>

                {isAdmin && (
                  <button className="add-btn" onClick={openNewPlayer}>
                    <Plus size={18} />
                    إضافة لاعب
                  </button>
                )}
              </div>

              <div className="filters">
                <div className="search-box">
                  <Search size={19} />
                  <input
                    type="search"
                    placeholder="ابحث عن اسم اللاعب..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>

                <select value={position} onChange={e => setPosition(e.target.value)}>
                  <option value="الكل">جميع المراكز</option>
                  <option value="هجوم">هجوم</option>
                  <option value="وسط">وسط</option>
                  <option value="دفاع">دفاع</option>
                  <option value="حارس">حارس</option>
                </select>

                <button className="refresh-btn" onClick={loadAll}>
                  <RefreshCw size={18} />
                </button>
              </div>

              {loading ? (
                <div className="empty-state">
                  <RefreshCw className="spin" size={30} />
                  <p>جارٍ تحميل البيانات...</p>
                </div>
              ) : error ? (
                <div className="error-state">
                  <p>تعذر تحميل بيانات اللاعبين.</p>
                  <small>{error}</small>
                  <button onClick={loadAll}>إعادة المحاولة</button>
                </div>
              ) : filteredPlayers.length === 0 ? (
                <div className="empty-state">
                  <Users size={40} />
                  <h3>لا يوجد لاعبون حاليًا</h3>
                  <p>ستظهر بيانات اللاعبين هنا عند إضافتهم.</p>
                </div>
              ) : (
                <div className="players-grid">
                  {filteredPlayers.map((player, index) => (
                    <motion.article
                      key={player.id}
                      className="player-card"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * .03 }}
                      whileHover={{ y: -4 }}
                      onClick={() => setSelectedPlayer(player)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="player-image">
                        {player.photo ? (
                          <img
                            src={player.photo}
                            alt={player.name}
                            style={{
                              width: '100%',
                              height: `${settings.playerImageHeight || 210}px`,
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <UserCircle size={75} />
                        )}

                        <span className="position-badge">
                          {player.position || 'لاعب'}
                        </span>
                      </div>

                      <div className="player-info">
                        <h3>{player.name}</h3>
                        <p style={{ fontSize: 13 }}>
                          {player.position || 'لاعب الأكاديمية'}
                        </p>

                        <button
                          type="button"
                          className="admin-btn"
                          style={{ marginTop: 10 }}
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedPlayer(player);
                          }}
                        >
                          <Eye size={15} />
                          عرض التفاصيل
                        </button>

                        {isAdmin && (
                          <div className="player-actions">
                            <button
                              className="admin-btn"
                              onClick={e => {
                                e.stopPropagation();
                                openEditPlayer(player);
                              }}
                            >
                              <Pencil size={15} />
                              تعديل
                            </button>

                            <button
                              className="delete-btn"
                              onClick={e => {
                                e.stopPropagation();
                                deletePlayer(player.id);
                              }}
                            >
                              <Trash2 size={15} />
                              حذف
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.article>
                  ))}
                </div>
              )}
            </motion.section>
          )}

          {activeTab === 'schedule' && (
            <motion.section
              key="schedule"
              className="section"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="section-heading">
                <div>
                  <h2>مواعيد التدريبات والمباريات</h2>
                  <p>تابع آخر المواعيد والأنشطة</p>
                </div>

                {isAdmin && (
                  <button className="add-btn" onClick={() => setShowScheduleForm(true)}>
                    <Plus size={18} />
                    إضافة موعد
                  </button>
                )}
              </div>

              {sessions.length === 0 ? (
                <div className="empty-state">
                  <Calendar size={40} />
                  <h3>لا توجد مواعيد منشورة</h3>
                </div>
              ) : (
                <div className="schedule-list">
                  {sessions.map(item => (
                    <div key={item.id} style={cardStyle}>
                      <h3>{item.title}</h3>
                      <p><Calendar size={15} /> {item.session_date || ''}</p>
                      <p><Clock size={15} /> {item.start_time || ''} - {item.end_time || ''}</p>

                      {item.location && (
                        <p><MapPin size={15} /> {item.location}</p>
                      )}

                      {item.notes && <p>{item.notes}</p>}

                      {isAdmin && (
                        <button className="delete-btn" onClick={() => deleteSchedule(item.id)}>
                          <Trash2 size={15} />
                          حذف الموعد
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.section>
          )}

          {activeTab === 'honor' && (
            <motion.section
              key="honor"
              className="section"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div style={{ ...cardStyle, textAlign: 'center' }}>
                <Trophy size={45} />
                <h2>{settings.playerOfWeekName}</h2>

                <img
                  src={settings.playerOfWeek}
                  alt="لاعب الأسبوع"
                  style={{
                    width: '100%',
                    maxWidth: 420,
                    height: 300,
                    objectFit: 'cover',
                    borderRadius: 15
                  }}
                />

                <p>{settings.playerOfWeekDescription}</p>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <footer className="footer">
          <img src={settings.logo} alt="" />
          <p>أكاديمية الحملة الأردنية الهاشمية الرياضية للأيتام</p>
          <span>معًا نصنع المستقبل</span>

          {installPrompt && (
            <button style={primaryButton} onClick={installApp}>
              <Smartphone size={17} />
              تثبيت التطبيق
            </button>
          )}
        </footer>
      </main>

      {/* تفاصيل اللاعب */}
      <AnimatePresence>
        {selectedPlayer && (
          <div style={modalBackdrop}>
            <motion.div
              initial={{ opacity: 0, y: 30, scale: .95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: .95 }}
              className="modal player-detail-modal"
            >
              <button className="close-btn" onClick={() => setSelectedPlayer(null)}>
                <X />
              </button>

              {selectedPlayer.photo ? (
                <img src={selectedPlayer.photo} alt={selectedPlayer.name} className="player-detail-image" />
              ) : (
                <UserCircle size={100} />
              )}

              <h2 style={{ textAlign: 'center', marginTop: 18 }}>
                {selectedPlayer.name}
              </h2>

              <div className="player-detail-position">
                {selectedPlayer.position || 'لاعب الأكاديمية'}
              </div>

              {selectedPlayer.age && <p>العمر: {selectedPlayer.age} سنة</p>}

              <div className="stats-grid">
                <div style={cardStyle}>
                  <Trophy size={22} />
                  <h3>{selectedPlayer.pace ?? 0}</h3>
                  <span>السرعة</span>
                </div>

                <div style={cardStyle}>
                  <Award size={22} />
                  <h3>{selectedPlayer.skill ?? 0}</h3>
                  <span>المهارة</span>
                </div>
              </div>

              {Object.entries(selectedPlayer.extra_data || {}).map(([key, value]) => (
                <p key={key}>
                  <strong>{key}:</strong> {String(value)}
                </p>
              ))}

              <button
                className="submit-btn"
                style={{ width: '100%', marginTop: 15 }}
                onClick={() => setSelectedPlayer(null)}
              >
                إغلاق
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* إضافة وتعديل لاعب */}
      <AnimatePresence>
        {showPlayerForm && isAdmin && (
          <div style={modalBackdrop}>
            <motion.form
              className="modal add-modal"
              onSubmit={savePlayer}
              initial={{ scale: .9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <button type="button" className="close-btn" onClick={() => setShowPlayerForm(false)}>
                <X />
              </button>

              <h2>{editingPlayer ? 'تعديل بيانات اللاعب' : 'إضافة لاعب جديد'}</h2>

              <input
                style={inputStyle}
                placeholder="اسم اللاعب"
                value={playerForm.name}
                onChange={e => setPlayerForm({ ...playerForm, name: e.target.value })}
                required
              />

              <select
                style={inputStyle}
                value={playerForm.position}
                onChange={e => setPlayerForm({ ...playerForm, position: e.target.value })}
              >
                <option value="هجوم">هجوم</option>
                <option value="وسط">وسط</option>
                <option value="دفاع">دفاع</option>
                <option value="حارس">حارس</option>
              </select>

              <input
                style={inputStyle}
                type="number"
                placeholder="العمر"
                min="5"
                max="25"
                value={playerForm.age}
                onChange={e => setPlayerForm({ ...playerForm, age: e.target.value })}
              />

              <input
                style={inputStyle}
                type="number"
                placeholder="السرعة من 100"
                min="0"
                max="100"
                value={playerForm.pace}
                onChange={e => setPlayerForm({ ...playerForm, pace: e.target.value })}
              />

              <input
                style={inputStyle}
                type="number"
                placeholder="المهارة من 100"
                min="0"
                max="100"
                value={playerForm.skill}
                onChange={e => setPlayerForm({ ...playerForm, skill: e.target.value })}
              />

              <label>صورة اللاعب JPG</label>
              <input
                style={inputStyle}
                type="file"
                accept=".jpg,.jpeg,image/jpeg"
                onChange={e => changePlayerImage(e.target.files[0])}
              />

              {playerForm.photo && (
                <img src={playerForm.photo} alt="معاينة" className="upload-preview" />
              )}

              <hr />
              <h3>بيانات إضافية للاعب</h3>

              {extraFields.map((field, index) => (
                <div key={index} className="extra-field-row">
                  <input
                    style={inputStyle}
                    placeholder="اسم الحقل"
                    value={field.key}
                    onChange={e => setExtraFields(old =>
                      old.map((item, i) => i === index ? { ...item, key: e.target.value } : item)
                    )}
                  />

                  <input
                    style={inputStyle}
                    placeholder="القيمة"
                    value={field.value}
                    onChange={e => setExtraFields(old =>
                      old.map((item, i) => i === index ? { ...item, value: e.target.value } : item)
                    )}
                  />

                  <button
                    type="button"
                    onClick={() => setExtraFields(old => old.filter((_, i) => i !== index))}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                style={{ ...primaryButton, marginBottom: 12 }}
                onClick={() => setExtraFields(old => [...old, { key: '', value: '' }])}
              >
                <Plus size={16} />
                إضافة حقل جديد
              </button>

              <button type="submit" className="submit-btn">
                <Save size={17} />
                حفظ البيانات
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* إضافة موعد */}
      <AnimatePresence>
        {showScheduleForm && isAdmin && (
          <div style={modalBackdrop}>
            <motion.form
              className="modal add-modal"
              onSubmit={saveSchedule}
              initial={{ scale: .9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <button type="button" className="close-btn" onClick={() => setShowScheduleForm(false)}>
                <X />
              </button>

              <h2>إضافة موعد جديد</h2>

              <input
                style={inputStyle}
                placeholder="عنوان الموعد"
                value={scheduleForm.title}
                onChange={e => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                required
              />

              <label>التاريخ</label>
              <input
                style={inputStyle}
                type="date"
                value={scheduleForm.session_date}
                onChange={e => setScheduleForm({ ...scheduleForm, session_date: e.target.value })}
              />

              <label>وقت البداية</label>
              <input
                style={inputStyle}
                type="time"
                value={scheduleForm.start_time}
                onChange={e => setScheduleForm({ ...scheduleForm, start_time: e.target.value })}
              />

              <label>وقت النهاية</label>
              <input
                style={inputStyle}
                type="time"
                value={scheduleForm.end_time}
                onChange={e => setScheduleForm({ ...scheduleForm, end_time: e.target.value })}
              />

              <input
                style={inputStyle}
                placeholder="المكان"
                value={scheduleForm.location}
                onChange={e => setScheduleForm({ ...scheduleForm, location: e.target.value })}
              />

              <textarea
                style={inputStyle}
                placeholder="ملاحظات"
                value={scheduleForm.notes}
                onChange={e => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
              />

              <button type="submit" className="submit-btn">حفظ الموعد</button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* إضافة إشعار */}
      <AnimatePresence>
        {showNotificationForm && isAdmin && (
          <div style={modalBackdrop}>
            <motion.form
              className="modal"
              onSubmit={saveNotification}
              initial={{ scale: .9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <button type="button" className="close-btn" onClick={() => setShowNotificationForm(false)}>
                <X />
              </button>

              <h2>إضافة إشعار</h2>

              <input
                style={inputStyle}
                placeholder="عنوان الإشعار"
                value={notificationForm.title}
                onChange={e => setNotificationForm({ ...notificationForm, title: e.target.value })}
                required
              />

              <textarea
                style={inputStyle}
                placeholder="نص الإشعار"
                value={notificationForm.body}
                onChange={e => setNotificationForm({ ...notificationForm, body: e.target.value })}
              />

              <label>
                <input
                  type="checkbox"
                  checked={notificationForm.is_published}
                  onChange={e => setNotificationForm({ ...notificationForm, is_published: e.target.checked })}
                />
                نشر الإشعار للجميع
              </label>

              <button type="submit" className="submit-btn">حفظ الإشعار</button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* لوحة التحكم */}
      <AnimatePresence>
        {showSettings && isAdmin && (
          <div style={modalBackdrop}>
            <motion.div
              className="modal add-modal settings-modal"
              initial={{ scale: .9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <button className="close-btn" onClick={() => setShowSettings(false)}>
                <X />
              </button>

              <h2>
                <Settings size={22} />
                لوحة تحكم الأكاديمية
              </h2>

              {/* حماية لوحة الإدارة */}
              <div style={{ ...cardStyle, marginBottom: 14 }}>
                <h3>
                  <Shield size={20} />
                  حماية لوحة الإدارة
                </h3>

                <p>يمكنك تغيير رمز PIN المستخدم لحماية لوحة الإدارة.</p>

                <form onSubmit={changeAdminPin}>
                  <input
                    style={inputStyle}
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]{4}"
                    maxLength={4}
                    placeholder="رمز PIN الجديد"
                    value={newPin}
                    onChange={e =>
                      setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))
                    }
                    required
                  />

                  <input
                    style={inputStyle}
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]{4}"
                    maxLength={4}
                    placeholder="تأكيد رمز PIN الجديد"
                    value={confirmPin}
                    onChange={e =>
                      setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))
                    }
                    required
                  />

                  <button
                    type="submit"
                    style={goldButton}
                    disabled={pinLoading}
                  >
                    <Lock size={16} />
                    {pinLoading ? 'جارٍ التغيير...' : 'تغيير رمز PIN'}
                  </button>
                </form>
              </div>

              {/* تغيير كلمة مرور الإدارة */}
              <div style={{ ...cardStyle, marginBottom: 14 }}>
                <h3>
                  <Lock size={20} />
                  تغيير كلمة مرور الإدارة
                </h3>

                <p>
                  يمكنك تغيير كلمة مرور حساب الإدارة من هنا دون تغيير رمز PIN.
                </p>

                <form onSubmit={changeAdminPassword}>
                  <input
                    style={inputStyle}
                    type="password"
                    placeholder="كلمة المرور الجديدة"
                    value={settingsNewPassword}
                    onChange={e => setSettingsNewPassword(e.target.value)}
                    minLength={8}
                    autoComplete="new-password"
                    required
                  />

                  <input
                    style={inputStyle}
                    type="password"
                    placeholder="تأكيد كلمة المرور الجديدة"
                    value={settingsConfirmPassword}
                    onChange={e => setSettingsConfirmPassword(e.target.value)}
                    minLength={8}
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="submit"
                    style={goldButton}
                    disabled={pinLoading}
                  >
                    <Save size={16} />
                    {pinLoading
                      ? 'جارٍ تغيير كلمة المرور...'
                      : 'حفظ كلمة المرور الجديدة'}
                  </button>
                </form>
              </div>

              {/* إعدادات المظهر */}
              <div style={{ ...cardStyle, marginBottom: 14 }}>
                <h3><Palette size={20} /> تخصيص مظهر الموقع</h3>
                <p>غيّر ألوان الموقع والخطوط وشكل البطاقات، ثم احفظ التعديلات.</p>

                <div className="theme-preview">
                  <div className="theme-preview-header">
                    <span>معاينة المظهر</span>
                    <span>الأكاديمية</span>
                  </div>

                  <div className="theme-preview-card">
                    <strong>نص تجريبي للبطاقة</strong>
                    <p>هذا مثال يوضح شكل الألوان والخط المختار.</p>
                    <button type="button" style={goldButton}>زر تجريبي</button>
                  </div>
                </div>

                <h4>ألوان الموقع</h4>

                <div className="theme-colors-grid">
                  {Object.entries(themeLabels).map(([key, label]) => (
                    <label className="color-control" key={key}>
                      <span>{label}</span>
                      <input
                        type="color"
                        value={normalizeTheme(settings.theme)[key]}
                        onChange={e => updateTheme(key, e.target.value)}
                      />
                      <small>{normalizeTheme(settings.theme)[key]}</small>
                    </label>
                  ))}
                </div>

                <hr />

                <h4><Type size={18} /> نوع الخط</h4>
                <select
                  style={inputStyle}
                  value={settings.theme?.fontFamily || 'Cairo'}
                  onChange={e => updateTheme('fontFamily', e.target.value)}
                >
                  {fontOptions.map(font => (
                    <option key={font.value} value={font.value}>{font.label}</option>
                  ))}
                </select>

                <hr />

                <h4><SlidersHorizontal size={18} /> شكل البطاقات</h4>

                <label>استدارة زوايا البطاقات: {settings.theme?.cardRadius ?? 17}px</label>
                <input
                  style={inputStyle}
                  type="range"
                  min="5"
                  max="30"
                  value={settings.theme?.cardRadius ?? 17}
                  onChange={e => updateTheme('cardRadius', Number(e.target.value))}
                />

                <label className="theme-checkbox">
                  <input
                    type="checkbox"
                    checked={settings.theme?.cardShadow !== false}
                    onChange={e => updateTheme('cardShadow', e.target.checked)}
                  />
                  تفعيل الظلال للبطاقات
                </label>

                <div className="settings-actions">
                  <button
                    type="button"
                    style={goldButton}
                    onClick={() => saveSettings(settings)}
                  >
                    <Save size={17} />
                    حفظ المظهر
                  </button>

                  <button
                    type="button"
                    style={primaryButton}
                    onClick={resetTheme}
                  >
                    <RotateCcw size={16} />
                    استعادة الافتراضي
                  </button>
                </div>
              </div>

              {/* الصور الرئيسية */}
              <div style={{ ...cardStyle, marginBottom: 14 }}>
                <h3><Image size={19} /> الصور الرئيسية</h3>

                <p>شعار الأكاديمية</p>
                <img src={settings.logo} alt="الشعار" className="settings-logo-preview" />

                <input
                  style={inputStyle}
                  type="file"
                  accept=".jpg,.jpeg,image/jpeg"
                  onChange={e => changeSettingImage('logo', e.target.files[0])}
                />

                <hr />

                <p>صورة لاعب الأسبوع</p>
                <img src={settings.playerOfWeek} alt="لاعب الأسبوع" className="settings-honor-preview" />

                <input
                  style={inputStyle}
                  type="file"
                  accept=".jpg,.jpeg,image/jpeg"
                  onChange={e => changeSettingImage('playerOfWeek', e.target.files[0])}
                />

                <input
                  style={inputStyle}
                  placeholder="اسم لاعب الأسبوع"
                  value={settings.playerOfWeekName}
                  onChange={e => setSettings({ ...settings, playerOfWeekName: e.target.value })}
                />

                <textarea
                  style={inputStyle}
                  placeholder="وصف لاعب الأسبوع"
                  value={settings.playerOfWeekDescription}
                  onChange={e => setSettings({ ...settings, playerOfWeekDescription: e.target.value })}
                />

                <button
                  type="button"
                  style={primaryButton}
                  onClick={() => saveSettings(settings)}
                >
                  <Save size={16} />
                  حفظ بيانات لاعب الأسبوع
                </button>
              </div>

              {/* إعدادات الصور */}
              <div style={{ ...cardStyle, marginBottom: 14 }}>
                <h3>إعدادات الصور</h3>

                <label>ارتفاع صورة الواجهة الرئيسية بالبكسل</label>
                <input
                  style={inputStyle}
                  type="number"
                  min="180"
                  max="700"
                  value={settings.imageHeight}
                  onChange={e => setSettings({ ...settings, imageHeight: Number(e.target.value) })}
                />

                <label>ارتفاع صور اللاعبين بالبكسل</label>
                <input
                  style={inputStyle}
                  type="number"
                  min="120"
                  max="500"
                  value={settings.playerImageHeight}
                  onChange={e => setSettings({ ...settings, playerImageHeight: Number(e.target.value) })}
                />

                <button
                  type="button"
                  style={primaryButton}
                  onClick={() => saveSettings(settings)}
                >
                  <Save size={16} />
                  حفظ أحجام الصور
                </button>
              </div>

              {/* شرائح الصفحة الرئيسية */}
              <div style={{ ...cardStyle, marginBottom: 14 }}>
                <h3>شرائح الصفحة الرئيسية</h3>

                {settings.slides.map((slide, index) => (
                  <div key={index} className="slide-editor">
                    <h4>الشريحة {index + 1}</h4>

                    <img src={slide.image} alt="" className="slide-preview" />

                    <input
                      style={inputStyle}
                      type="file"
                      accept=".jpg,.jpeg,image/jpeg"
                      onChange={e => changeSlideImage(index, e.target.files[0])}
                    />

                    <input
                      style={inputStyle}
                      placeholder="العنوان"
                      value={slide.title}
                      onChange={e => {
                        const slides = settings.slides.map((item, i) =>
                          i === index ? { ...item, title: e.target.value } : item
                        );
                        setSettings({ ...settings, slides });
                      }}
                    />

                    <textarea
                      style={inputStyle}
                      placeholder="الوصف"
                      value={slide.subtitle}
                      onChange={e => {
                        const slides = settings.slides.map((item, i) =>
                          i === index ? { ...item, subtitle: e.target.value } : item
                        );
                        setSettings({ ...settings, slides });
                      }}
                    />

                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => {
                        if (settings.slides.length <= 1) {
                          alert('يجب إبقاء شريحة واحدة على الأقل');
                          return;
                        }

                        setSettings({
                          ...settings,
                          slides: settings.slides.filter((_, i) => i !== index)
                        });
                      }}
                    >
                      <Trash2 size={15} />
                      حذف الشريحة
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  style={{ ...primaryButton, marginTop: 12 }}
                  onClick={() => setSettings({
                    ...settings,
                    slides: [
                      ...settings.slides,
                      {
                        image: '/assets/team-photo.jpg',
                        title: 'عنوان جديد',
                        subtitle: 'اكتب وصف الشريحة هنا'
                      }
                    ]
                  })}
                >
                  <Plus size={16} />
                  إضافة شريحة
                </button>

                <button
                  type="button"
                  style={{ ...primaryButton, marginTop: 12, width: '100%' }}
                  onClick={() => saveSettings(settings)}
                >
                  <Save size={16} />
                  حفظ جميع الشرائح
                </button>
              </div>

              {/* النسخ الاحتياطي */}
              <div style={{ ...cardStyle, marginBottom: 14 }}>
                <h3><Database size={20} /> النسخ الاحتياطي</h3>

                <p>
                  يمكنك تنزيل نسخة من بيانات اللاعبين والمواعيد والإشعارات وإعدادات الموقع.
                </p>

                <button
                  type="button"
                  style={{ ...goldButton, width: '100%', marginBottom: 12 }}
                  onClick={exportBackup}
                >
                  <Download size={18} />
                  تنزيل نسخة احتياطية
                </button>

                <label>استعادة نسخة احتياطية JSON</label>
                <input
                  style={inputStyle}
                  type="file"
                  accept=".json,application/json"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) importBackup(file);
                    e.target.value = '';
                  }}
                />

                <small>
                  الاستعادة تدمج السجلات مع البيانات الحالية ولا تحذف السجلات الموجودة.
                  ملفات الصور نفسها لا تدخل في النسخة الاحتياطية، وإنما تُحفظ روابطها.
                </small>
              </div>

              {/* إدارة الإشعارات */}
              <div style={cardStyle}>
                <h3><Bell size={19} /> إدارة الإشعارات</h3>

                <button
                  type="button"
                  style={primaryButton}
                  onClick={() => {
                    setShowSettings(false);
                    setShowNotificationForm(true);
                  }}
                >
                  <Plus size={16} />
                  إضافة إشعار جديد
                </button>

                {notifications.map(item => (
                  <div key={item.id} className="notification-admin-item">
                    <strong>{item.title}</strong>
                    <p>{item.body}</p>

                    <button className="delete-btn" onClick={() => deleteNotification(item.id)}>
                      <Trash2 size={15} />
                      حذف
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* نافذة الإشعارات */}
      <AnimatePresence>
        {showNotifications && (
          <div style={modalBackdrop}>
            <motion.div
              className="modal"
              initial={{ scale: .9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <button className="close-btn" onClick={() => setShowNotifications(false)}>
                <X />
              </button>

              <h2><Bell size={22} /> إشعارات الأكاديمية</h2>

              {notifications.length === 0 ? (
                <p>لا توجد إشعارات جديدة.</p>
              ) : (
                notifications.map(item => (
                  <div key={item.id} style={{ ...cardStyle, marginBottom: 10 }}>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                    <small>
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString('ar')
                        : ''}
                    </small>
                  </div>
                ))
              )}

              <button className="submit-btn" onClick={() => setShowNotifications(false)}>
                إغلاق
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
  }
