import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { domToPng } from 'modern-screenshot';
import profileIslandImage from './assets/profile-island.jpg';
import { IslandIcon } from './icons';
import { TaskIcon } from './task-icons';
import type { AppData, HistoryItem, IconName, Reward, Task, TaskTone } from './types';

const storageKey = 'kidsCheckInReactV1';
const superParentPin = '******';

const initialTasks: Task[] = [
  { id: 1, name: '语文', icon: 'chinese', tone: 'blue', category: 'learning', score: 0 },
  { id: 2, name: '趣味数学', icon: 'calculator', tone: 'purple', category: 'learning', score: 0 },
  { id: 3, name: '英语绘本', icon: 'language', tone: 'green', category: 'learning', score: 0 },
  { id: 4, name: '表演', icon: 'performance', tone: 'orange', category: 'learning', score: 0 },
  { id: 5, name: '家务助手', icon: 'broom', tone: 'pink', category: 'life', score: 0 },
  { id: 6, name: '运动打卡', icon: 'run', tone: 'teal', category: 'life', score: 0 },
  { id: 7, name: '按时睡觉', icon: 'moon', tone: 'blue', category: 'life', score: 0 },
  { id: 8, name: '收拾整理', icon: 'tidy', tone: 'green', category: 'life', score: 0 },
];

const initialRewards: Reward[] = [
  { id: 1, name: '看动画片 30 分钟', cost: 3 },
  { id: 2, name: '买一个小玩具', cost: 10 },
  { id: 3, name: '去游乐园', cost: 50 },
];

const defaultData: AppData = {
  childName: '小朋友',
  tasks: initialTasks,
  rewards: initialRewards,
  crowns: 0,
  history: [],
  pin: null,
};

type Tab = 'home' | 'rewards' | 'profile';
type DialogState =
  | null
  | { type: 'prompt'; title: string; label: string; value?: string; inputType?: string; onConfirm: (value: string) => void }
  | { type: 'confirm'; title: string; message: string; confirmText?: string; onConfirm: () => void };

type PinState = null | { title: string; description: string; onSuccess: () => void };

export function App() {
  const [data, setData] = useState<AppData>(() => loadData());
  const [tab, setTab] = useState<Tab>('home');
  const [dialog, setDialog] = useState<DialogState>(null);
  const [pinState, setPinState] = useState<PinState>(null);
  const [toast, setToast] = useState<string>('');
  const [adminMode, setAdminMode] = useState<'tasks' | 'rewards' | null>(null);
  const [confetti, setConfetti] = useState(0);
  const [animatedTaskId, setAnimatedTaskId] = useState<number | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [exportingCertificate, setExportingCertificate] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 1800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!confetti) return;
    const timer = window.setTimeout(() => setConfetti(0), 1300);
    return () => window.clearTimeout(timer);
  }, [confetti]);

  const totalStars = useMemo(() => data.tasks.reduce((sum, task) => sum + task.score, 0), [data.tasks]);
  const today = new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date());
  const certificateDate = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  function patchData(updater: (current: AppData) => AppData) {
    setData(current => updater(cloneData(current)));
  }

  function addHistory(message: string, value: number, type: HistoryItem['type']) {
    return {
      id: Date.now() + Math.random(),
      time: new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
      message,
      value,
      type,
    };
  }

  function addScore(taskId: number) {
    setAnimatedTaskId(taskId);
    window.setTimeout(() => setAnimatedTaskId(current => (current === taskId ? null : current)), 420);
    patchData(current => {
      const task = current.tasks.find(item => item.id === taskId);
      if (!task) return current;
      task.score += 1;
      current.history.unshift(addHistory(`完成 ${task.name}`, 1, 'add'));
      if (task.score >= 10) {
        task.score = 0;
        current.crowns += 1;
        current.history.unshift(addHistory('满 10 颗星自动换成皇冠', 1, 'add'));
        setToast('太棒了，获得 1 个皇冠');
        setConfetti(Date.now());
      } else {
        setToast(`${task.name} 加 1 颗星`);
      }
      return current;
    });
  }

  function removeScore(taskId: number) {
    patchData(current => {
      const task = current.tasks.find(item => item.id === taskId);
      if (!task || task.score <= 0) return current;
      task.score -= 1;
      current.history.unshift(addHistory(`撤回 ${task.name}`, -1, 'system'));
      setToast('已撤回 1 颗星');
      return current;
    });
  }

  function exchangeReward(reward: Reward) {
    if (data.crowns < reward.cost) return;
    setDialog({
      type: 'confirm',
      title: '确认兑换',
      message: `兑换「${reward.name}」需要 ${reward.cost} 个皇冠。`,
      confirmText: '兑换',
      onConfirm: () => {
        patchData(current => {
          current.crowns -= reward.cost;
          current.history.unshift(addHistory(`兑换 ${reward.name}`, -reward.cost, 'spend'));
          setToast('兑换成功');
          return current;
        });
      },
    });
  }

  function requirePin(action: () => void) {
    if (!data.pin) {
      setDialog({
        type: 'prompt',
        title: '设置家长密码',
        label: '请输入 4 到 6 位数字',
        inputType: 'password',
        onConfirm: value => {
          const nextPin = value.trim();
          if (!/^\d{4,6}$/.test(nextPin)) {
            setToast('请输入 4 到 6 位数字');
            return;
          }
          patchData(current => ({ ...current, pin: nextPin }));
          setToast('家长密码已设置');
          action();
        },
      });
      return;
    }
    setPinState({ title: '家长验证', description: '输入密码后可以修改任务和奖励', onSuccess: action });
  }

  function changeName() {
    setDialog({
      type: 'prompt',
      title: '修改名字',
      label: '孩子的昵称',
      value: data.childName,
      onConfirm: value => {
        const nextName = value.trim() || '小朋友';
        patchData(current => ({ ...current, childName: nextName }));
        setToast('名字已更新');
      },
    });
  }

  function changePin() {
    requirePin(() => {
      setDialog({
        type: 'prompt',
        title: '修改家长密码',
        label: '新的 4 到 6 位数字',
        inputType: 'password',
        onConfirm: value => {
          const nextPin = value.trim();
          if (!/^\d{4,6}$/.test(nextPin)) {
            setToast('请输入 4 到 6 位数字');
            return;
          }
          patchData(current => ({ ...current, pin: nextPin }));
          setToast('密码已更新');
        },
      });
    });
  }

  function resetAll() {
    requirePin(() => {
      setDialog({
        type: 'confirm',
        title: '重置所有数据',
        message: '这会清空当前星星、皇冠和记录。',
        confirmText: '重置',
        onConfirm: () => {
          setData(defaultData);
          setToast('数据已重置');
        },
      });
    });
  }

  function generateCertificate() {
    setShowCertificate(true);
  }

  async function exportCertificateImage() {
    if (!certificateRef.current || exportingCertificate) return;
    setExportingCertificate(true);
    try {
      const dataUrl = await domToPng(certificateRef.current, {
        scale: 2,
        backgroundColor: '#fff8e7',
      });
      const anchor = document.createElement('a');
      anchor.href = dataUrl;
      anchor.download = `${data.childName || '小朋友'}-荣誉奖状.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setToast('奖状图片已保存');
    } catch {
      setToast('保存失败，请再试一次');
    } finally {
      setExportingCertificate(false);
    }
  }

  function upsertTask(task?: Task) {
    setDialog({
      type: 'prompt',
      title: task ? '编辑任务' : '新增任务',
      label: '任务名称',
      value: task?.name,
      onConfirm: value => {
        const name = value.trim();
        if (!name) return;
        patchData(current => {
          if (task) {
            current.tasks = current.tasks.map(item => (item.id === task.id ? { ...item, name } : item));
          } else {
            current.tasks.push({
              id: Date.now(),
              name,
              icon: nextIcon(current.tasks.length),
              tone: nextTone(current.tasks.length),
              category: current.tasks.length % 2 === 0 ? 'learning' : 'life',
              score: 0,
            });
          }
          return current;
        });
      },
    });
  }

  function deleteTask(task: Task) {
    setDialog({
      type: 'confirm',
      title: '删除任务',
      message: `确定删除「${task.name}」吗？`,
      confirmText: '删除',
      onConfirm: () => patchData(current => ({ ...current, tasks: current.tasks.filter(item => item.id !== task.id) })),
    });
  }

  function upsertReward(reward?: Reward) {
    setDialog({
      type: 'prompt',
      title: reward ? '编辑奖励' : '新增奖励',
      label: reward ? '奖励名称' : '奖励名称，例如 买一本书',
      value: reward?.name,
      onConfirm: nameValue => {
        const name = nameValue.trim();
        if (!name) return;
        setDialog({
          type: 'prompt',
          title: '皇冠价格',
          label: '需要几个皇冠',
          value: reward?.cost.toString() ?? '5',
          inputType: 'number',
          onConfirm: costValue => {
            const cost = Math.max(1, Number(costValue) || 1);
            patchData(current => {
              if (reward) {
                current.rewards = current.rewards.map(item => (item.id === reward.id ? { ...item, name, cost } : item));
              } else {
                current.rewards.push({ id: Date.now(), name, cost });
              }
              return current;
            });
          },
        });
      },
    });
  }

  function deleteReward(reward: Reward) {
    setDialog({
      type: 'confirm',
      title: '删除奖励',
      message: `确定删除「${reward.name}」吗？`,
      confirmText: '删除',
      onConfirm: () => patchData(current => ({ ...current, rewards: current.rewards.filter(item => item.id !== reward.id) })),
    });
  }

  function exportData() {
    const file = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(file);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `kids-check-in-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function importData(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        setData(normalizeData(parsed));
        setToast('导入成功');
      } catch {
        setToast('导入失败');
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="app-shell">
      {confetti ? <Confetti /> : null}
      <header className="top-bar">
        <button className="avatar-button" onClick={changeName} aria-label="修改名字">
          {data.childName.slice(0, 1)}
        </button>
        <div className="top-copy">
          <div className="child-name">{data.childName}</div>
          <div className="today">{today}</div>
        </div>
        <button className="crown-pill" onClick={() => setTab('rewards')}>
          <IslandIcon name="crown" />
          <span>{data.crowns}</span>
        </button>
      </header>

      <main className="page-area">
        {tab === 'home' ? (
          <HomeView tasks={data.tasks} animatedTaskId={animatedTaskId} onAddScore={addScore} onRemoveScore={removeScore} />
        ) : null}
        {tab === 'rewards' ? (
          <RewardsView crowns={data.crowns} rewards={data.rewards} onExchange={exchangeReward} />
        ) : null}
        {tab === 'profile' ? (
          <ProfileView
            data={data}
            totalStars={totalStars}
            onChangeName={changeName}
            onChangePin={changePin}
            onExport={exportData}
            onImport={importData}
            onOpenTasks={() => requirePin(() => setAdminMode('tasks'))}
            onOpenRewards={() => requirePin(() => setAdminMode('rewards'))}
            onGenerateCertificate={generateCertificate}
            onReset={resetAll}
          />
        ) : null}
      </main>

      <nav className="tab-bar">
        <TabButton active={tab === 'home'} icon="star" label="赚星星" onClick={() => setTab('home')} />
        <TabButton active={tab === 'rewards'} icon="gift" label="换礼物" onClick={() => setTab('rewards')} />
        <TabButton active={tab === 'profile'} icon="user" label="我的" onClick={() => setTab('profile')} />
      </nav>

      {adminMode ? (
        <AdminPanel
          mode={adminMode}
          tasks={data.tasks}
          rewards={data.rewards}
          onClose={() => setAdminMode(null)}
          onAddTask={() => upsertTask()}
          onEditTask={upsertTask}
          onDeleteTask={deleteTask}
          onAddReward={() => upsertReward()}
          onEditReward={upsertReward}
          onDeleteReward={deleteReward}
        />
      ) : null}

      {pinState ? (
        <PinModal
          state={pinState}
          pin={data.pin}
          onClose={() => setPinState(null)}
          onSuccess={() => {
            const action = pinState.onSuccess;
            setPinState(null);
            action();
          }}
          onError={() => setToast('密码不正确')}
        />
      ) : null}

      {dialog ? <Dialog state={dialog} onClose={() => setDialog(null)} /> : null}
      {showCertificate ? (
        <CertificateModal
          childName={data.childName}
          crowns={data.crowns}
          stars={totalStars}
          date={certificateDate}
          exporting={exportingCertificate}
          certificateRef={certificateRef}
          onClose={() => setShowCertificate(false)}
          onExport={exportCertificateImage}
        />
      ) : null}
      <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>
    </div>
  );
}

function HomeView({
  tasks,
  animatedTaskId,
  onAddScore,
  onRemoveScore,
}: {
  tasks: Task[];
  animatedTaskId: number | null;
  onAddScore: (id: number) => void;
  onRemoveScore: (id: number) => void;
}) {
  return (
    <>
      <TaskSection title="学习任务" tasks={tasks.filter(task => task.category === 'learning')} animatedTaskId={animatedTaskId} onAddScore={onAddScore} onRemoveScore={onRemoveScore} />
      <TaskSection title="生活表现" tasks={tasks.filter(task => task.category === 'life')} animatedTaskId={animatedTaskId} onAddScore={onAddScore} onRemoveScore={onRemoveScore} />
    </>
  );
}

function TaskSection({
  title,
  tasks,
  animatedTaskId,
  onAddScore,
  onRemoveScore,
}: {
  title: string;
  tasks: Task[];
  animatedTaskId: number | null;
  onAddScore: (id: number) => void;
  onRemoveScore: (id: number) => void;
}) {
  return (
    <section className="task-section">
      <h2 className="section-title">{title}</h2>
      <div className="task-grid">
        {tasks.map(task => (
          <article className={`task-card tone-${task.tone}`} key={task.id}>
            <button className={`task-icon color-${task.tone} ${animatedTaskId === task.id ? 'is-bouncing' : ''}`} onClick={() => onAddScore(task.id)} aria-label={`给${task.name}加星`}>
              <span className="task-icon-glyph">
                <TaskIcon name={task.icon} />
              </span>
            </button>
            <h3>{task.name}</h3>
            <div className="star-row">
              {task.score === 0 ? (
                <span className="empty-stars">做任务领星星</span>
              ) : (
                Array.from({ length: task.score }).map((_, index) => (
                  <button className="star-button" key={index} onClick={() => onRemoveScore(task.id)} aria-label="撤回一颗星">
                    <IslandIcon name="star" />
                  </button>
                ))
              )}
            </div>
            <p>{task.score >= 10 ? '可以兑换皇冠' : `还差 ${10 - task.score} 颗`}</p>
            <button className="add-button" onClick={() => onAddScore(task.id)} aria-label={`给${task.name}加星`}>
              <IslandIcon name="plus" />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function RewardsView({
  crowns,
  rewards,
  onExchange,
}: {
  crowns: number;
  rewards: Reward[];
  onExchange: (reward: Reward) => void;
}) {
  return (
    <section>
      <h2 className="section-title">奖励兑换</h2>
      <div className="shop-banner">
        <IslandIcon name="gift" />
        <div>
          <strong>奖励小铺</strong>
          <span>当前可用皇冠：{crowns}</span>
        </div>
      </div>
      <div className="reward-list">
        {rewards.map(reward => {
          const canExchange = crowns >= reward.cost;
          return (
            <article className="reward-card" key={reward.id}>
              <div className="reward-icon">
                <IslandIcon name="gift" />
              </div>
              <div className="reward-info">
                <h3>{reward.name}</h3>
                <span className="price-tag">
                  <IslandIcon name="crown" /> {reward.cost}
                </span>
              </div>
              <button disabled={!canExchange} onClick={() => onExchange(reward)}>
                {canExchange ? '兑换' : '不足'}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ProfileView({
  data,
  totalStars,
  onChangeName,
  onChangePin,
  onExport,
  onImport,
  onOpenTasks,
  onOpenRewards,
  onGenerateCertificate,
  onReset,
}: {
  data: AppData;
  totalStars: number;
  onChangeName: () => void;
  onChangePin: () => void;
  onExport: () => void;
  onImport: (file: File | null) => void;
  onOpenTasks: () => void;
  onOpenRewards: () => void;
  onGenerateCertificate: () => void;
  onReset: () => void;
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [showDanger, setShowDanger] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const settingsPanelRef = useRef<HTMLDivElement>(null);
  const recentAddHistory = data.history.filter(item => item.value > 0).slice(0, 5);

  useEffect(() => {
    if (!showSettings) return;
    window.setTimeout(() => {
      settingsPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  }, [showSettings]);

  return (
    <section className="profile-page">
      <div className="profile-achievement-card">
        <div className="profile-island-background" style={{ backgroundImage: `url(${profileIslandImage})` }} />
        <span className="profile-float-item flower one" />
        <span className="profile-float-item flower two" />
        <span className="profile-float-item sparkle one" />
        <span className="profile-float-item sparkle two" />

        <div className="profile-card-header">
          <span>STAR ISLAND</span>
          <h2>{data.childName || '小朋友'}的星星岛</h2>
          <p>每一颗星星，都是今天认真努力的证据。</p>
        </div>

        <div className="profile-score-board">
          <div className="profile-score-item star-score">
            <IslandIcon name="star" />
            <span>现有星星</span>
            <strong>{totalStars}</strong>
          </div>
          <div className="profile-score-item crown-score">
            <IslandIcon name="crown" />
            <span>现有皇冠</span>
            <strong>{data.crowns}</strong>
          </div>
        </div>

        <button className="certificate-button profile-certificate-button" onClick={onGenerateCertificate}>
          <IslandIcon name="star" /> 生成荣誉奖状
        </button>

        <div className="history-list compact profile-history-list">
          <div className="history-preview-header">
            <span>最近加分</span>
            <button onClick={() => setShowHistory(true)} disabled={data.history.length === 0}>查看更多积分记录</button>
          </div>
          {recentAddHistory.length === 0 ? (
            <p className="empty-history">还没有加分记录，先完成一个任务吧。</p>
          ) : (
            recentAddHistory.map(item => (
              <div className="history-line" key={item.id}>
                <span>{item.time}</span>
                <strong>{item.message}</strong>
                <em className={item.type}>{item.value > 0 ? `+${item.value}` : item.value}</em>
              </div>
            ))
          )}
        </div>

        <button className="settings-entry-button" onClick={() => setShowSettings(current => !current)} aria-expanded={showSettings}>
          <IslandIcon name="settings" /> {showSettings ? '收起设置' : '设置'}
        </button>
        {showSettings ? (
          <div className="settings-panel" ref={settingsPanelRef}>
            <div className="menu-list">
              <MenuButton icon="edit" title="修改名字" desc="设置专属打卡昵称" onClick={onChangeName} />
              <MenuButton icon="settings" title="任务项管理" desc="添加、重命名或删除任务" onClick={onOpenTasks} />
              <MenuButton icon="gift" title="礼物项管理" desc="添加、重命名或删除奖励" onClick={onOpenRewards} />
              <MenuButton icon="key" title="修改家长密码" desc="保护后台数据" onClick={onChangePin} />
            </div>

            <div className="data-actions">
              <button onClick={onExport}>
                <IslandIcon name="download" /> 导出数据
              </button>
              <label>
                <IslandIcon name="upload" /> 导入数据
                <input type="file" accept=".json" onChange={event => onImport(event.target.files?.[0] ?? null)} />
              </label>
            </div>

            <button className="more-settings-button" onClick={() => setShowDanger(current => !current)}>
              <IslandIcon name="trash" /> 危险操作
            </button>
            {showDanger ? (
              <div className="more-settings-panel">
                <button className="danger-button" onClick={onReset}>
                  <IslandIcon name="trash" /> 重置所有数据
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {showHistory ? <HistoryModal history={data.history} onClose={() => setShowHistory(false)} /> : null}
    </section>
  );
}

function HistoryModal({ history, onClose }: { history: HistoryItem[]; onClose: () => void }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card history-modal-card">
        <div className="modal-title-badge">积分记录</div>
        <div className="history-modal-list">
          {history.length === 0 ? (
            <p className="empty-history">还没有记录，先完成一个任务吧。</p>
          ) : (
            history.map(item => (
              <div className="history-line" key={item.id}>
                <span>{item.time}</span>
                <strong>{item.message}</strong>
                <em className={item.type}>{item.value > 0 ? `+${item.value}` : item.value}</em>
              </div>
            ))
          )}
        </div>
        <div className="modal-actions single">
          <button onClick={onClose}>关闭</button>
        </div>
      </div>
    </div>
  );
}

function AdminPanel({
  mode,
  tasks,
  rewards,
  onClose,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onAddReward,
  onEditReward,
  onDeleteReward,
}: {
  mode: 'tasks' | 'rewards';
  tasks: Task[];
  rewards: Reward[];
  onClose: () => void;
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onAddReward: () => void;
  onEditReward: (reward: Reward) => void;
  onDeleteReward: (reward: Reward) => void;
}) {
  return (
    <div className="panel-screen">
      <header className="panel-header">
        <button onClick={onClose} aria-label="关闭">
          <IslandIcon name="close" />
        </button>
        <h2>{mode === 'tasks' ? '任务管理' : '奖励管理'}</h2>
        <button onClick={mode === 'tasks' ? onAddTask : onAddReward}>
          <IslandIcon name="plus" /> 添加
        </button>
      </header>
      <div className="admin-list">
        {mode === 'tasks'
          ? tasks.map(task => (
              <AdminRow key={task.id} icon={task.icon} title={task.name} desc={task.category === 'learning' ? '学习任务' : '生活表现'} onEdit={() => onEditTask(task)} onDelete={() => onDeleteTask(task)} />
            ))
          : rewards.map(reward => (
              <AdminRow key={reward.id} icon="gift" title={reward.name} desc={`${reward.cost} 个皇冠`} onEdit={() => onEditReward(reward)} onDelete={() => onDeleteReward(reward)} />
            ))}
      </div>
    </div>
  );
}

function AdminRow({
  icon,
  title,
  desc,
  onEdit,
  onDelete,
}: {
  icon: IconName;
  title: string;
  desc: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="admin-row">
      <IslandIcon name={icon} />
      <div>
        <strong>{title}</strong>
        <span>{desc}</span>
      </div>
      <button onClick={onEdit} aria-label="编辑">
        <IslandIcon name="edit" />
      </button>
      <button onClick={onDelete} aria-label="删除">
        <IslandIcon name="trash" />
      </button>
    </div>
  );
}

function TabButton({ active, icon, label, onClick }: { active: boolean; icon: IconName; label: string; onClick: () => void }) {
  return (
    <button className={active ? 'active' : ''} onClick={onClick}>
      <IslandIcon name={icon} />
      <span>{label}</span>
    </button>
  );
}

function StatCard({ icon, label, value }: { icon: IconName; label: string; value: number }) {
  return (
    <div className="stat-card">
      <IslandIcon name={icon} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function MenuButton({ icon, title, desc, onClick }: { icon: IconName; title: string; desc: string; onClick: () => void }) {
  return (
    <button className="menu-button" onClick={onClick}>
      <IslandIcon name={icon} />
      <span>
        <strong>{title}</strong>
        <small>{desc}</small>
      </span>
    </button>
  );
}

function Dialog({ state, onClose }: { state: NonNullable<DialogState>; onClose: () => void }) {
  const [value, setValue] = useState(state.type === 'prompt' ? state.value ?? '' : '');

  function confirm() {
    onClose();
    if (state.type === 'prompt') state.onConfirm(value);
    if (state.type === 'confirm') state.onConfirm();
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-title-badge">{state.title}</div>
        {state.type === 'prompt' ? (
          <div className="modal-dialogue">
            <label>{state.label}</label>
            <input value={value} type={state.inputType ?? 'text'} onChange={event => setValue(event.target.value)} autoFocus />
          </div>
        ) : (
          <p className="modal-dialogue">{state.message}</p>
        )}
        <div className="modal-actions">
          <button onClick={onClose}>取消</button>
          <button onClick={confirm}>{state.type === 'confirm' ? state.confirmText ?? '确认' : '确认'}</button>
        </div>
      </div>
    </div>
  );
}

function CertificateModal({
  childName,
  crowns,
  stars,
  date,
  exporting,
  certificateRef,
  onClose,
  onExport,
}: {
  childName: string;
  crowns: number;
  stars: number;
  date: string;
  exporting: boolean;
  certificateRef: React.RefObject<HTMLDivElement>;
  onClose: () => void;
  onExport: () => void;
}) {
  return (
    <div className="certificate-backdrop">
      <div className="certificate-window">
        <div className="certificate-paper" ref={certificateRef}>
          <div className="certificate-corner one" />
          <div className="certificate-corner two" />
          <div className="certificate-medal">
            <IslandIcon name="star" />
          </div>
          <p className="certificate-kicker">STAR AWARD</p>
          <h2>荣誉奖状</h2>
          <p className="certificate-name">颁给 {childName || '小朋友'}</p>
          <p className="certificate-message">认真完成任务，持续收集星星，今天也很棒。</p>
          <div className="certificate-stats">
            <div>
              <span>星星</span>
              <strong>{stars}</strong>
            </div>
            <div>
              <span>皇冠</span>
              <strong>{crowns}</strong>
            </div>
          </div>
          <p className="certificate-date">{date}</p>
        </div>
        <div className="certificate-actions">
          <button onClick={onClose}>关闭</button>
          <button onClick={onExport} disabled={exporting}>
            {exporting ? '生成中...' : '保存为图片'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PinModal({
  state,
  pin,
  onClose,
  onSuccess,
  onError,
}: {
  state: NonNullable<PinState>;
  pin: string | null;
  onClose: () => void;
  onSuccess: () => void;
  onError: () => void;
}) {
  const [value, setValue] = useState('');

  function submit() {
    if (value === pin || value === superParentPin) onSuccess();
    else onError();
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-title-badge">{state.title}</div>
        <div className="modal-dialogue">
          <p>{state.description}</p>
          <input value={value} type="password" maxLength={6} onChange={event => setValue(event.target.value)} autoFocus />
        </div>
        <div className="modal-actions">
          <button onClick={onClose}>取消</button>
          <button onClick={submit}>确认</button>
        </div>
      </div>
    </div>
  );
}

function Confetti() {
  return (
    <div className="confetti-layer" aria-hidden="true">
      {Array.from({ length: 24 }).map((_, index) => (
        <i key={index} style={{ '--i': index } as CSSProperties} />
      ))}
    </div>
  );
}

function loadData(): AppData {
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return cloneData(defaultData);
    return normalizeData(JSON.parse(saved));
  } catch {
    return cloneData(defaultData);
  }
}

function normalizeData(source: unknown): AppData {
  const input = isRecord(source) ? source : {};
  const previousTasks = readArray(input.tasks) ?? readArray(input.subjects) ?? [];
  const previousRewards = readArray(input.rewards) ?? readArray(input.gifts) ?? [];
  const previousHistory = readArray(input.history) ?? [];
  const legacyNameMap: Record<string, string> = {
    古诗背诵: '语文',
    家务帮手: '家务助手',
  };
  const scoreByName = new Map<string, number>();
  previousTasks.forEach((item, index) => {
    if (!isRecord(item)) return;
    const rawName = readString(item.name) || initialTasks[index]?.name;
    if (!rawName) return;
    scoreByName.set(legacyNameMap[rawName] ?? rawName, readNumber(item.score) ?? 0);
  });

  const rewards = previousRewards.length
    ? previousRewards.flatMap((item, index) => {
        if (!isRecord(item)) return [];
        const name = readString(item.name);
        if (!name) return [];
        return [{
          id: readNumber(item.id) ?? Date.now() + index,
          name,
          cost: Math.max(1, readNumber(item.cost) ?? 1),
        }];
      })
    : cloneData(initialRewards);

  return {
    ...cloneData(defaultData),
    childName: readString(input.childName) || readString(input.userName) || defaultData.childName,
    rewards,
    crowns: readNumber(input.crowns) ?? readNumber(input.totalCrowns) ?? defaultData.crowns,
    history: previousHistory.flatMap((item, index) => {
      if (!isRecord(item)) return [];
      const message = readString(item.message) || readString(item.msg);
      if (!message) return [];
      const rawType = readString(item.type);
      const value = readNumber(item.value) ?? readNumber(item.val) ?? 0;
      return [{
        id: readNumber(item.id) ?? Date.now() + index,
        time: readString(item.time) || '',
        message,
        value,
        type: rawType === 'spend' || rawType === 'system' ? rawType : value < 0 ? 'system' : 'add',
      }];
    }),
    pin: readString(input.pin) || null,
    tasks: initialTasks.map(task => ({
      ...task,
      score: scoreByName.get(task.name) ?? 0,
    })),
  };
}

function cloneData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readArray(value: unknown): unknown[] | null {
  return Array.isArray(value) ? value : null;
}

function readString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function readNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function buildCertificateSvg({
  childName,
  crowns,
  stars,
  date,
}: {
  childName: string;
  crowns: number;
  stars: number;
  date: string;
}) {
  const name = escapeSvgText(childName || '小朋友');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="840" viewBox="0 0 1200 840">
  <rect width="1200" height="840" rx="48" fill="#FFF8E7"/>
  <rect x="56" y="56" width="1088" height="728" rx="40" fill="#FDFDF5" stroke="#F7CD67" stroke-width="18"/>
  <rect x="92" y="92" width="1016" height="656" rx="28" fill="none" stroke="#E8DCC8" stroke-width="6" stroke-dasharray="18 16"/>
  <circle cx="600" cy="188" r="54" fill="#F7CD67"/>
  <path d="M600 126l18 38 42 6-30 30 7 42-37-20-37 20 7-42-30-30 42-6z" fill="#FFF8E7"/>
  <text x="600" y="300" text-anchor="middle" font-family="Nunito, Noto Sans SC, PingFang SC, sans-serif" font-size="72" font-weight="900" fill="#794F27">荣誉奖状</text>
  <text x="600" y="392" text-anchor="middle" font-family="Noto Sans SC, PingFang SC, sans-serif" font-size="38" font-weight="700" fill="#794F27">颁给 ${name}</text>
  <text x="600" y="470" text-anchor="middle" font-family="Noto Sans SC, PingFang SC, sans-serif" font-size="32" fill="#8C7354">你认真完成任务，持续收集星星，表现很棒。</text>
  <g font-family="Nunito, Noto Sans SC, PingFang SC, sans-serif" font-weight="900" text-anchor="middle">
    <rect x="320" y="530" width="220" height="120" rx="32" fill="#E6F9F6"/>
    <text x="430" y="588" font-size="34" fill="#50B9AB">星星</text>
    <text x="430" y="633" font-size="42" fill="#794F27">${stars}</text>
    <rect x="660" y="530" width="220" height="120" rx="32" fill="#FFF7DD"/>
    <text x="770" y="588" font-size="34" fill="#DBA90E">皇冠</text>
    <text x="770" y="633" font-size="42" fill="#794F27">${crowns}</text>
  </g>
  <text x="600" y="710" text-anchor="middle" font-family="Noto Sans SC, PingFang SC, sans-serif" font-size="26" fill="#9F927D">${escapeSvgText(date)}</text>
</svg>`;
}

function escapeSvgText(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function nextTone(index: number): TaskTone {
  const tones: TaskTone[] = ['blue', 'purple', 'green', 'pink', 'orange', 'teal'];
  return tones[index % tones.length];
}

function nextIcon(index: number): IconName {
  const icons: IconName[] = ['chinese', 'calculator', 'language', 'performance', 'broom', 'run', 'moon', 'tidy'];
  return icons[index % icons.length];
}
