import { useNavigate } from 'react-router-dom';

export default function Documents() {
  const navigate = useNavigate();

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4 text-foreground">📁 Документы</h1>

      <div className="text-center py-12">
        <div className="text-4xl mb-3">📁</div>
        <div className="text-foreground mb-2">Раздел в разработке</div>
        <div className="text-xs text-muted-foreground mb-4">
          Функционал загрузки и управления документами будет доступен в следующем обновлении
        </div>
        <button
          onClick={() => navigate('/')}
          className="text-sm text-primary"
        >
          ← На главную
        </button>
      </div>
    </div>
  );
}
