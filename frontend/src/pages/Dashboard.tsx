import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { jobsAPI, applicationsAPI } from '../services/api';
import type { Job, Application } from '../types';
import './Dashboard.css';

export function Dashboard() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'jobs' | 'my-jobs' | 'applications'>('jobs');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showJobApplications, setShowJobApplications] = useState(false);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const fetchedJobs = await jobsAPI.getAll({ title: searchTerm || undefined });
      setJobs(fetchedJobs);
    } catch (err) {
      addToast('Erro ao carregar vagas', 'error');
    }
  };

  const loadMyJobs = async () => {
    try {
      const fetchedJobs = await jobsAPI.getMyJobs();
      setMyJobs(fetchedJobs);
    } catch (err) {
      addToast('Erro ao carregar suas vagas', 'error');
    }
  };

  const loadApplications = async () => {
    try {
      const fetchedApps = await applicationsAPI.getMyApplications();
      setApplications(fetchedApps);
    } catch (err) {
      addToast('Erro ao carregar candidaturas', 'error');
    }
  };

  const handleTabChange = (tab: 'jobs' | 'my-jobs' | 'applications') => {
    setActiveTab(tab);
    if (tab === 'jobs') loadJobs();
    else if (tab === 'my-jobs') loadMyJobs();
    else if (tab === 'applications') loadApplications();
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Recrutamento & Seleção</h1>
          <div className="user-info">
            <span className="user-email">{user?.email}</span>
            <button onClick={logout} className="btn-logout">
              Sair
            </button>
          </div>
        </div>
      </header>

      <nav className="tabs">
        <button
          className={`tab ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => handleTabChange('jobs')}
        >
          Buscar Vagas
        </button>
        <button
          className={`tab ${activeTab === 'my-jobs' ? 'active' : ''}`}
          onClick={() => handleTabChange('my-jobs')}
        >
          Minhas Vagas
        </button>
        <button
          className={`tab ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => handleTabChange('applications')}
        >
          Minhas Candidaturas
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'jobs' && (
          <div className="jobs-section">
            <div className="section-header">
              <h2>Vagas Disponíveis</h2>
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Buscar por título..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadJobs()}
                />
                <button onClick={loadJobs} className="btn-search">
                  Buscar
                </button>
              </div>
              <button onClick={() => setShowCreateModal(true)} className="btn-create">
                + Criar Vaga
              </button>
            </div>

            <div className="jobs-grid">
              {jobs.length === 0 ? (
                <p className="no-results">Nenhuma vaga encontrada</p>
              ) : (
                jobs.map((job: Job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onView={() => {
                      setSelectedJob(job);
                      setShowJobDetails(true);
                    }}
                    onApply={() => {
                      setSelectedJob(job);
                      setShowApplyModal(true);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'my-jobs' && (
          <div className="jobs-section">
            <div className="section-header">
              <h2>Minhas Vagas Criadas</h2>
              <button onClick={() => setShowCreateModal(true)} className="btn-create">
                + Criar Vaga
              </button>
            </div>

            <div className="jobs-grid">
              {myJobs.length === 0 ? (
                <p className="no-results">Você ainda não criou vagas</p>
              ) : (
                myJobs.map((job: Job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isOwner
                    onView={() => {
                      setSelectedJob(job);
                      setShowJobDetails(true);
                    }}
                    onEdit={() => {
                      setSelectedJob(job);
                      setShowEditModal(true);
                    }}
                    onApplications={() => {
                      setSelectedJob(job);
                      setShowJobApplications(true);
                    }}
                    onDelete={() => {
                      setSelectedJob(job);
                      setShowDeleteConfirm(true);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="applications-section">
            <h2>Minhas Candidaturas</h2>
            {applications.length === 0 ? (
              <p className="no-results">Você ainda não se candidatou a nenhuma vaga</p>
            ) : (
              <div className="applications-list">
                {applications.map((app) => (
                  <ApplicationCard key={app.id} application={app} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {showCreateModal && (
        <CreateJobModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            if (activeTab === 'my-jobs') loadMyJobs();
          }}
        />
      )}

      {selectedJob && showApplyModal && (
        <ApplyModal
          job={selectedJob}
          onClose={() => {
            setShowApplyModal(false);
            setSelectedJob(null);
          }}
          onSuccess={() => {
            setShowApplyModal(false);
            setSelectedJob(null);
            setActiveTab('applications');
            loadApplications();
          }}
        />
      )}

      {selectedJob && showJobApplications && (
        <JobApplicationsModal
          job={selectedJob}
          onClose={() => {
            setShowJobApplications(false);
            setSelectedJob(null);
          }}
        />
      )}

      {selectedJob && showJobDetails && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => {
            setShowJobDetails(false);
            setSelectedJob(null);
          }}
          onApply={() => {
            setShowJobDetails(false);
            setShowApplyModal(true);
          }}
        />
      )}

      {selectedJob && showEditModal && (
        <EditJobModal
          job={selectedJob}
          onClose={() => {
            setShowEditModal(false);
            setSelectedJob(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedJob(null);
            loadMyJobs();
            loadJobs();
            addToast('Vaga atualizada com sucesso!', 'success');
          }}
        />
      )}

      {selectedJob && showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Excluir Vaga</h2>
            <p>Tem certeza que deseja excluir a vaga <strong>{selectedJob.title}</strong>? Esta ação não pode ser desfeita.</p>
            <div className="modal-actions">
              <button 
                onClick={() => setShowDeleteConfirm(false)} 
                className="btn-cancel"
              >
                Cancelar
              </button>
              <button 
                onClick={async () => {
                  try {
                    await jobsAPI.delete(selectedJob.id);
                    addToast('Vaga excluída com sucesso', 'success');
                    setShowDeleteConfirm(false);
                    setSelectedJob(null);
                    loadMyJobs();
                    loadJobs();
                  } catch (err) {
                    addToast('Erro ao excluir vaga', 'error');
                  }
                }} 
                className="btn-danger"
              >
                Excluir Permanentemente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function JobCard({
  job,
  isOwner,
  onView,
  onApply,
  onEdit,
  onDelete,
  onApplications,
}: {
  job: Job;
  isOwner?: boolean;
  onView: () => void;
  onApply?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onApplications?: () => void;
}) {
  return (
    <div className="job-card">
      <h3>{job.title}</h3>
      <p className="company">{job.company}</p>
      <p className="location">{job.location || 'Não especificado'}</p>
      {job.salary && <p className="salary">R$ {job.salary.toFixed(2)}</p>}
      <p className="description">{job.description.substring(0, 100)}...</p>
      <div className="job-actions">
        <button onClick={onView} className="btn-view">
          Ver Detalhes
        </button>
        {isOwner ? (
          <>
            <button onClick={onEdit} className="btn-edit">
              Editar
            </button>
            <button onClick={onDelete} className="btn-delete-small" title="Excluir Vaga">
              &times;
            </button>
            <button onClick={onApplications} className="btn-applications">
              Candidaturas
            </button>
          </>
        ) : (
          <button onClick={onApply} className="btn-apply">
            Candidatar-se
          </button>
        )}
      </div>
    </div>
  );
}

function JobDetailsModal({
  job,
  onClose,
  onApply,
}: {
  job: Job;
  onClose: () => void;
  onApply: () => void;
}) {
  const { user } = useAuth();
  const isOwner = user?.id === job.created_by;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-premium">
          <h2>{job.title}</h2>
          <p className="company-badge">{job.company}</p>
        </div>
        
        <div className="job-details-grid">
          <div className="detail-item">
            <span className="label">Localização</span>
            <span className="value">{job.location || 'Não especificado'}</span>
          </div>
          <div className="detail-item">
            <span className="label">Salário</span>
            <span className="value">{job.salary ? `R$ ${job.salary.toLocaleString('pt-BR')}` : 'Não informado'}</span>
          </div>
          <div className="detail-item">
            <span className="label">Publicada em</span>
            <span className="value">{new Date(job.created_at).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>

        <div className="detail-section">
          <h3>Descrição da Vaga</h3>
          <p className="description-text">{job.description}</p>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn-cancel">
            Fechar
          </button>
          {!isOwner && (
            <button onClick={onApply} className="btn-primary">
              Candidatar-se Agora
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function EditJobModal({
  job,
  onClose,
  onSuccess,
}: {
  job: Job;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    title: job.title,
    description: job.description,
    company: job.company,
    location: job.location,
    salary: job.salary.toString(),
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await jobsAPI.update(job.id, {
        ...formData,
        salary: parseFloat(formData.salary) || 0,
      });
      onSuccess();
    } catch (err) {
      // Toast handles this via onSuccess callback in parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Editar Vaga</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Título</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Empresa</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Localização</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Salário</label>
            <input
              type="number"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label>Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={8}
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ApplicationCard({ application }: { application: Application }) {
  const statusColors: Record<string, string> = {
    pending: '#f0ad4e',
    approved: '#5cb85c',
    rejected: '#d9534f',
  };

  return (
    <div className="application-card">
      <div className="app-info">
        <h4>{application.job?.title || 'Vaga'}</h4>
        <p className="company">{application.job?.company || ''}</p>
      </div>
      <div className="app-status">
        <span
          className="status-badge"
          style={{ backgroundColor: statusColors[application.status] || '#999' }}
        >
          {application.status.toUpperCase()}
        </span>
      </div>
      <div className="app-date">
        {new Date(application.created_at).toLocaleDateString('pt-BR')}
      </div>
    </div>
  );
}

function CreateJobModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    salary: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await jobsAPI.create({
        title: formData.title,
        description: formData.description,
        company: formData.company,
        location: formData.location,
        salary: parseFloat(formData.salary) || 0,
      });
      addToast('Vaga criada com sucesso!', 'success');
      onSuccess();
    } catch (err) {
      addToast('Erro ao criar vaga. Verifique os campos.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Criar Nova Vaga</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Título</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Empresa</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Localização</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Ex: São Paulo - SP (Remoto)"
            />
          </div>
          <div className="form-group">
            <label>Salário</label>
            <input
              type="number"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              step="0.01"
              placeholder="0.00"
            />
          </div>
          <div className="form-group">
            <label>Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={5}
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Vaga'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ApplyModal({
  job,
  onClose,
  onSuccess,
}: {
  job: Job;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { addToast } = useToast();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await applicationsAPI.create(job.id, message);
      addToast('Candidatura enviada com sucesso!', 'success');
      onSuccess();
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Erro ao enviar candidatura', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Candidatar-se a {job.title}</h2>
        <p className="modal-subtitle">{job.company}</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Mensagem (opcional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="Conte um pouco sobre você e por que se interessa pela vaga..."
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Candidatura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function JobApplicationsModal({
  job,
  onClose,
}: {
  job: Job;
  onClose: () => void;
}) {
  const { addToast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useState(() => {
    jobsAPI.getApplications(job.id).then(setApplications).finally(() => setLoading(false));
  });

  const updateStatus = async (id: number, status: string) => {
    try {
      await applicationsAPI.updateStatus(id, status);
      setApplications((prev) =>
        prev.map((app: Application) => (app.id === id ? { ...app, status } : app))
      );
      addToast(`Status atualizado para ${status}`, 'success');
    } catch (err) {
      addToast('Erro ao atualizar status', 'error');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <h2>Candidaturas - {job.title}</h2>
        <p className="modal-subtitle">{job.company}</p>
        {loading ? (
          <p>Carregando...</p>
        ) : applications.length === 0 ? (
          <p>Nenhuma candidatura recebida</p>
        ) : (
          <div className="applications-table">
            <table>
              <thead>
                <tr>
                  <th>Candidato</th>
                  <th>Mensagem</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td>{app.user?.email || 'N/A'}</td>
                    <td>{app.message || '-'}</td>
                    <td>
                      <span className={`status-${app.status}`}>{app.status}</span>
                    </td>
                    <td>
                      <select
                        value={app.status}
                        onChange={(e) => updateStatus(app.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="modal-actions">
          <button onClick={onClose} className="btn-cancel">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
