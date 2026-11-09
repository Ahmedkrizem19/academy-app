import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy, Users, Calendar, Shield, Search, Plus,
  Trash2, LogOut, Lock, Award, Clock,
  X, RefreshCw, UserCircle, Menu
} from 'lucide-react';

const supabaseUrl = 'https://gyvxvomagibbamhvfwbn.supabase.co';

const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5dnh2b21hZ2liYmFtaHZmd2JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxODM5ODcsImV4cCI6MjEwOTc1OTk4N30.fxg8h2IgRR3NcE9mY9piACg1feH7U_UMHeadjsfFjGQ';

const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [search, setSearch] = useState('');
  const [position, setPosition] = useState('الكل');

  const [newPlayer, setNewPlayer] = useState({
    name: '',
    position: 'هجوم',
    age: '',
    pace: 80,
    skill: 85,
    photo: ''
  });

  const [activeTab, setActiveTab] = useState('players');

  useEffect(() => {
    loadPlayers();

    supabase.auth.getSession().then(({ data }) => {
      setIsAdmin(!!data.session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsAdmin(!!session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function loadPlayers() {
    setLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setPlayers(data || []);
    }

    setLoading(false);
  }

  async function login(e) {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      alert('تعذر تسجيل الدخول: ' + error.message);
      return;
    }

    setShowLogin(false);
    setEmail('');
    setPassword('');
    alert('تم تسجيل دخول الإدارة بنجاح');
  }

  async function logout() {
    await supabase.auth.signOut();
    setIsAdmin(false);
  }

  async function addPlayer(e) {
    e.preventDefault();

    if (!newPlayer.name.trim()) {
      alert('يرجى كتابة اسم اللاعب');
      return;
    }

    const playerData = {
      name: newPlayer.name.trim(),
      position: newPlayer.position,
      age: newPlayer.age ? Number(newPlayer.age) : null,
      pace: Number(newPlayer.pace),
      skill: Number(newPlayer.skill),
      photo: newPlayer.photo.trim() || null
    };

    const { data, error } = await supabase
      .from('players')
      .insert([playerData])
      .select();

    if (error) {
      alert('حدث خطأ أثناء إضافة اللاعب: ' + error.message);
      return;
    }

    setPlayers(previous => [...previous, ...data]);

    setNewPlayer({
      name: '',
      position: 'هجوم',
      age: '',
      pace: 80,
      skill: 85,
      photo: ''
    });

    setShowAdd(false);
    alert('تمت إضافة اللاعب بنجاح لجميع زوار الموقع');
  }

  async function deletePlayer(id) {
    if (!window.confirm('هل أنت متأكد من حذف هذا اللاعب؟')) {
      return;
    }

    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', id);

    if (error) {
      alert('تعذر حذف اللاعب: ' + error.message);
      return;
    }

    setPlayers(previous => previous.filter(player => player.id !== id));
  }

  const filteredPlayers = players.filter(player => {
    const matchesName = (player.name || '')
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesPosition =
      position === 'الكل' || player.position === position;

    return matchesName && matchesPosition;
  });

  return (
    <div className="academy" dir="rtl">

      <header className="topbar">
        <div className="brand">
          <img src="/assets/logo.jpg" alt="شعار الأكاديمية" />

          <div>
            <h1>أكاديمية الحملة الأردنية الهاشمية الرياضية للأيتام</h1>
            <p>رعاية المواهب وصناعة الأبطال</p>
          </div>
        </div>

        <div className="header-actions">
          {isAdmin ? (
            <button className="logout-btn" onClick={logout}>
              <LogOut size={17} />
              خروج الإدارة
            </button>
          ) : (
            <button
              className="admin-btn"
              onClick={() => setShowLogin(true)}
            >
              <Lock size={17} />
              الإدارة
            </button>
          )}
        </div>
      </header>

      <main className="container">

        <section className="hero">
          <img
            src="/assets/team-celebration.jpg"
            alt="احتفالات فريق الأكاديمية"
            onError={e => {
              e.currentTarget.style.display = 'none';
            }}
          />

          <div className="hero-overlay">
            <span className="hero-tag">معًا نحو المستقبل</span>
            <h2>نصنع الأبطال ونرعى المواهب</h2>
            <p>
              بيئة رياضية تربوية تهدف إلى تطوير المواهب
              وبناء جيل متميز.
            </p>

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
        </section>

        <nav className="tabs">
          <button
            className={activeTab === 'players' ? 'active' : ''}
            onClick={() => setActiveTab('players')}
          >
            <Users size={18} />
            اللاعبون
          </button>

          <button
            className={activeTab === 'schedule' ? 'active' : ''}
            onClick={() => setActiveTab('schedule')}
          >
            <Calendar size={18} />
            المواعيد
          </button>

          <button
            className={activeTab === 'honor' ? 'active' : ''}
            onClick={() => setActiveTab('honor')}
          >
            <Award size={18} />
            لاعب الأسبوع
          </button>
        </nav>

        <AnimatePresence mode="wait">

          {activeTab === 'players' && (
            <motion.section
              key="players"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="section"
            >

              <div className="section-heading">
                <div>
                  <h2>نجوم الأكاديمية</h2>
                  <p>تعرف على لاعبي الأكاديمية ومواهبهم</p>
                </div>

                {isAdmin && (
                  <button
                    className="add-btn"
                    onClick={() => setShowAdd(true)}
                  >
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

                <select
                  value={position}
                  onChange={e => setPosition(e.target.value)}
                >
                  <option value="الكل">جميع المراكز</option>
                  <option value="هجوم">هجوم</option>
                  <option value="وسط">وسط</option>
                  <option value="دفاع">دفاع</option>
                  <option value="حارس">حارس</option>
                </select>

                <button
                  className="refresh-btn"
                  onClick={loadPlayers}
                  title="تحديث القائمة"
                >
                  <RefreshCw size={18} />
                </button>
              </div>

              {loading ? (
                <div className="empty-state">
                  <RefreshCw className="spin" size={30} />
                  <p>جارٍ تحميل اللاعبين...</p>
                </div>
              ) : error ? (
                <div className="error-state">
                  <p>تعذر تحميل بيانات اللاعبين.</p>
                  <small>{error}</small>
                  <button onClick={loadPlayers}>إعادة المحاولة</button>
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
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      whileHover={{ y: -5 }}
                    >
                      <div className="player-image">
                        {player.photo ? (
                          <img
                            src={player.photo}
                            alt={player.name}
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

                        <p className="player-age">
                          {player.age
                            ? `العمر: ${player.age} سنة`
                            : 'لا توجد معلومات عن العمر'}
                        </p>

                        <div className="player-skills">
                          <div>
                            <span>السرعة</span>
                            <strong>{player.pace ?? 0}</strong>
                          </div>

                          <div>
                            <span>المهارة</span>
                            <strong>{player.skill ?? 0}</strong>
                          </div>
                        </div>

                        {isAdmin && (
                          <button
                            className="delete-btn"
                            onClick={() => deletePlayer(player.id)}
                          >
                            <Trash2 size={16} />
                            حذف اللاعب
                          </button>
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
              className="section empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Calendar size={45} />
              <h2>مواعيد التدريبات والمباريات</h2>
              <p>
                سيتم تجهيز جدول التدريبات والمباريات في المرحلة التالية.
              </p>
            </motion.section>
          )}

          {activeTab === 'honor' && (
            <motion.section
              key="honor"
              className="section empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Trophy size={48} />
              <h2>نجم الأكاديمية</h2>
              <img
                className="honor-image"
                src="/assets/player-of-week.jpg"
                alt="لاعب الأسبوع"
              />
              <p>تكريم المواهب والتميز الرياضي.</p>
            </motion.section>
          )}

        </AnimatePresence>

        <footer className="footer">
          <img src="/assets/logo.jpg" alt="" />
          <p>أكاديمية الحملة الأردنية الهاشمية الرياضية للأيتام</p>
          <span>معًا نصنع المستقبل</span>
        </footer>

      </main>

      {/* نافذة تسجيل دخول المدير */}

      <AnimatePresence>
        {showLogin && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.form
              className="modal"
              onSubmit={login}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowLogin(false)}
              >
                <X size={20} />
              </button>

              <Lock size={35} className="modal-icon" />

              <h2>دخول الإدارة</h2>
              <p>يرجى إدخال بيانات حساب المدير</p>

              <input
                type="email"
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="كلمة المرور"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />

              <button type="submit" className="submit-btn">
                تسجيل الدخول
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* نافذة إضافة لاعب */}

      <AnimatePresence>
        {showAdd && isAdmin && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.form
              className="modal add-modal"
              onSubmit={addPlayer}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowAdd(false)}
              >
                <X size={20} />
              </button>

              <Plus size={35} className="modal-icon" />

              <h2>إضافة لاعب جديد</h2>

              <input
                type="text"
                placeholder="اسم اللاعب"
                value={newPlayer.name}
                onChange={e =>
                  setNewPlayer({
                    ...newPlayer,
                    name: e.target.value
                  })
                }
                required
              />

              <select
                value={newPlayer.position}
                onChange={e =>
                  setNewPlayer({
                    ...newPlayer,
                    position: e.target.value
                  })
                }
              >
                <option value="هجوم">هجوم</option>
                <option value="وسط">وسط</option>
                <option value="دفاع">دفاع</option>
                <option value="حارس">حارس</option>
              </select>

              <input
                type="number"
                placeholder="العمر"
                min="5"
                max="25"
                value={newPlayer.age}
                onChange={e =>
                  setNewPlayer({
                    ...newPlayer,
                    age: e.target.value
                  })
                }
              />

              <input
                type="number"
                placeholder="السرعة من 100"
                min="0"
                max="100"
                value={newPlayer.pace}
                onChange={e =>
                  setNewPlayer({
                    ...newPlayer,
                    pace: e.target.value
                  })
                }
              />

              <input
                type="number"
                placeholder="المهارة من 100"
                min="0"
                max="100"
                value={newPlayer.skill}
                onChange={e =>
                  setNewPlayer({
                    ...newPlayer,
                    skill: e.target.value
                  })
                }
              />

              <input
                type="url"
                placeholder="رابط صورة اللاعب (اختياري)"
                value={newPlayer.photo}
                onChange={e =>
                  setNewPlayer({
                    ...newPlayer,
                    photo: e.target.value
                  })
                }
              />

              <button type="submit" className="submit-btn">
                حفظ اللاعب
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
