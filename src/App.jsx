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
  playerImageWidth: 100,
  playerImageFit: 'cover',
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
  const [authLoading, setAuthLoading] = useState(false);

  const [showLogin, setShowLogin] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

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
  const [editingNotification, setEditingNotification] = useState(null);

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

  // تطبيق المظهر
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

  // تحميل البيانات حسب صلاحية المستخدم
  async function loadAll(includeAllNotifications = false) {
    setLoading(true);
    setError('');

    try {
      const [
        playersResult,
        sessionsResult,
        notificationsResult,
        settingsResult
      ] = await Promise.all([
        supabase.from('players').select('*').order('name'),

        supabase.from('training_sessions')
          .select('*')
          .order('session_date'),

        includeAllNotifications
          ? supabase.from('academy_notifications')
              .select('*')
              .order('created_at', { ascending: false })
          : supabase.from('academy_notifications')
              .select('*')
              .eq('is_published', true)
              .order('created_at', { ascending: false }),

        supabase.from('academy_settings')
          .select('*')
          .eq('id', 'main')
          .maybeSingle()
      ]);

      if (playersResult.error) {
        setError(playersResult.error.message);
      } else {
        setPlayers(playersResult.data || []);
      }

      if (!sessionsResult.error) {
        setSessions(sessionsResult.data || []);
      }

      if (!notificationsResult.error) {
        setNotifications(notificationsResult.data || []);
      } else {
        console.error('Notifications:', notificationsResult.error);
      }

      if (settingsResult.data?.content) {
        const saved = settingsResult.data.content;

        setSettings({
          ...initialSettings,
          ...saved,
          theme: normalizeTheme(saved.theme)
        });
      }
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء تحميل البيانات.');
    } finally {
      setLoading(false);
    }
  }

  // التحقق من جلسة الإدارة
  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error(error);
        return;
      }

      if (!mounted) return;

      const admin = data.session?.user?.id === ADMIN_UID;

      setIsAdmin(admin);
      setHasEntered(admin);

      await loadAll(admin);
    }

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'PASSWORD_RECOVERY') {
          const admin = session?.user?.id === ADMIN_UID;

          if (admin) {
            setIsAdmin(true);
            setHasEntered(false);
            setShowLogin(false);
            setShowForgotPassword(false);
            setShowResetPassword(true);
          }

          return;
        }

        const admin = session?.user?.id === ADMIN_UID;

        if (event === 'SIGNED_OUT' || !admin) {
          setIsAdmin(false);
          setHasEntered(false);
          if (event === 'SIGNED_OUT') {
            loadAll(false);
          }
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setIsAdmin(true);
          setHasEntered(true);
          loadAll(true);
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

  // الدخول كزائر
  async function enterAsVisitor() {
    if (isAdmin) {
      await supabase.auth.signOut();
    }

    setIsAdmin(false);
    setHasEntered(true);
    await loadAll(false);
  }

  // تسجيل دخول الإدارة بالبريد وكلمة المرور فقط
  async function login(e) {
    e.preventDefault();
    setAuthLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user?.id !== ADMIN_UID) {
        await supabase.auth.signOut();
        throw new Error('هذا الحساب غير مخوّل لدخول لوحة الإدارة.');
      }

      setIsAdmin(true);
      setHasEntered(true);
      setShowLogin(false);
      setEmail('');
      setPassword('');

      await loadAll(true);
    } catch (err) {
      alert('تعذر تسجيل الدخول: ' + err.message);
    } finally {
      setAuthLoading(false);
    }
  }

  // استعادة كلمة المرور
  async function sendPasswordReset(e) {
    e.preventDefault();

    if (!email.trim()) {
      alert('يرجى إدخال البريد الإلكتروني.');
      return;
    }

    setAuthLoading(true);

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
      setAuthLoading(false);
    }
  }

  // تعيين كلمة مرور جديدة
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

    setAuthLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      await supabase.auth.signOut();

      setIsAdmin(false);
      setHasEntered(false);
      setShowResetPassword(false);
      setNewPassword('');
      setConfirmNewPassword('');

      alert('تم تغيير كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.');
    } catch (err) {
      alert('تعذر تغيير كلمة المرور: ' + err.message);
    } finally {
      setAuthLoading(false);
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

    setAuthLoading(true);

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
      setAuthLoading(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();

    setIsAdmin(false);
    setHasEntered(false);
    setSettingsNewPassword('');
    setSettingsConfirmPassword('');
    setActiveTab('home');
    setShowSettings(false);
  }

  // رفع الصور: JPG و PNG و WebP
  async function uploadImage(file) {
    if (!file) return null;

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('يرجى اختيار صورة بصيغة JPG أو PNG أو WebP.');
      return null;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة يجب ألا يتجاوز 5 ميجابايت.');
      return null;
    }

    const extension = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp'
    }[file.type];

    const fileName =
      `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

    const { error } = await supabase.storage
      .from('academy-media')
      .upload(fileName, file, {
        contentType: file.type,
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
      ...initialSettings,
      ...updatedSettings,
      playerImageWidth: Math.min(
        100,
        Math.max(60, Number(updatedSettings.playerImageWidth) || 100)
      ),
      playerImageHeight: Math.min(
        500,
        Math.max(120, Number(updatedSettings.playerImageHeight) || 210)
      ),
      playerImageFit:
        updatedSettings.playerImageFit === 'contain' ? 'contain' : 'cover',
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

  // فتح نموذج لاعب جديد
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

  // تعديل لاعب
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

  // حفظ اللاعب
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

    const result = editingPlayer
      ? await supabase.from('players')
          .update(playerData)
          .eq('id', editingPlayer.id)
          .select()
      : await supabase.from('players')
          .insert([playerData])
          .select();

    if (result.error) {
      alert('تعذر حفظ اللاعب: ' + result.error.message);
      return;
    }

    await loadAll(isAdmin);
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

  // حفظ موعد تدريبي
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

    await loadAll(isAdmin);
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

  // فتح نموذج إشعار جديد
  function openNewNotification() {
    setEditingNotification(null);
    setNotificationForm({
      title: '',
      body: '',
      is_published: true
    });
    setShowSettings(false);
    setShowNotificationForm(true);
  }

  // فتح نموذج تعديل إشعار
  function openEditNotification(item) {
    if (!isAdmin) return;

    setEditingNotification(item);

    setNotificationForm({
      title: item.title || '',
      body: item.body || '',
      is_published: item.is_published === true
    });

    setShowSettings(false);
    setShowNotificationForm(true);
  }

  // إضافة أو تعديل إشعار
  async function saveNotification(e) {
    e.preventDefault();
    if (!isAdmin || !hasEntered) return;

    if (!notificationForm.title.trim()) {
      alert('يرجى كتابة عنوان الإشعار.');
      return;
    }

    const payload = {
      title: notificationForm.title.trim(),
      body: notificationForm.body.trim(),
      is_published: Boolean(notificationForm.is_published)
    };

    const result = editingNotification
      ? await supabase
          .from('academy_notifications')
          .update(payload)
          .eq('id', editingNotification.id)
      : await supabase
          .from('academy_notifications')
          .insert([payload]);

    if (result.error) {
      alert('تعذر حفظ الإشعار: ' + result.error.message);
      return;
    }

    setNotificationForm({
      title: '',
      body: '',
      is_published: true
    });

    setEditingNotification(null);
    setShowNotificationForm(false);

    await loadAll(true);

    alert('تم حفظ الإشعار بنجاح.');
  }

  // حذف إشعار
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

    await loadAll(true);
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

  // تصدير نسخة احتياطية
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

  // استيراد نسخة احتياطية
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
      await loadAll(true);

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
