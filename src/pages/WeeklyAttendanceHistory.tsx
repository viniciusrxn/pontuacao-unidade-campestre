
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppContext } from '../contexts/AppContext';
import { Check, Clock, Flag, Award, Shirt, User, X, Book, Image } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

const WeeklyAttendanceHistory = () => {
  const { currentUser, attendances, units } = useAppContext();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Redirect if not logged in as unit
  React.useEffect(() => {
    if (!currentUser || currentUser.type !== 'unit') {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  if (!currentUser || currentUser.type !== 'unit' || !currentUser.unitId) {
    return null;
  }

  // Get unit's attendance records
  const unitAttendances = attendances
    .filter(a => a.unitId === currentUser.unitId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const currentUnit = units.find(u => u.id === currentUser.unitId);
  if (!currentUnit) return null;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 md:p-6 rounded-lg shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Histórico de Presenças</h1>
                <p className="text-base md:text-lg opacity-90">{currentUnit.name}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 md:mb-6 flex justify-between items-center">
          <h2 className="text-lg md:text-xl font-semibold">Registros de Presença</h2>
          <Link to="/weekly-attendance">
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "default"}
              className="text-xs md:text-sm"
            >
              Nova Presença
            </Button>
          </Link>
        </div>

        {unitAttendances.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">Nenhum registro de presença ainda.</p>
              <Link to="/weekly-attendance" className="mt-4 inline-block">
                <Button>Registrar Presença</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {unitAttendances.map(attendance => (
              <Card key={attendance.id}>
                <CardHeader className="pb-2 md:pb-3">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <CardTitle className="text-base md:text-lg">
                      {new Date(attendance.date).toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-sm md:text-base font-bold">
                        {attendance.score} pontos
                      </span>
                      {attendance.status === 'pending' && (
                        <div className="bg-yellow-100 text-yellow-800 px-2 py-1 text-xs rounded-full">
                          Pendente
                        </div>
                      )}
                      {attendance.status === 'validated' && (
                        <div className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" /> Validado
                        </div>
                      )}
                      {attendance.status === 'rejected' && (
                        <div className="bg-red-100 text-red-800 px-2 py-1 text-xs rounded-full flex items-center gap-1">
                          <X className="w-3 h-3" /> Rejeitado
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                    <div className="flex items-center gap-1 md:gap-2">
                      <User className="text-primary w-4 h-4" />
                      <span className="text-sm">{attendance.presentMembers.length} presentes</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2">
                      <Clock className="text-amber-500 w-4 h-4" />
                      <span className="text-sm">{attendance.punctualCount} pontuais</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2">
                      <Award className="text-blue-500 w-4 h-4" />
                      <span className="text-sm">{attendance.neckerchiefCount} com lenço</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2">
                      <Shirt className="text-green-500 w-4 h-4" />
                      <span className="text-sm">{attendance.uniformCount} com uniforme</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2">
                      <Flag className="text-red-500 w-4 h-4" />
                      <span className="text-sm">{attendance.broughtFlag ? 'Bandeirim: Sim' : 'bandeirim: Não'}</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2">
                      <Book className="text-purple-500 w-4 h-4" />
                      <span className="text-sm">{attendance.broughtBible ? 'Bíblia: Sim' : 'Bíblia: Não'}</span>
                    </div>
                  </div>
                  
                  {/* Photo display */}
                  {attendance.photoUrl && (
                    <div className="mt-4 border-t pt-3">
                      <p className="flex items-center gap-1 text-sm font-medium mb-2">
                        <Image className="w-4 h-4" /> Foto do encontro:
                      </p>
                      <img 
                        src={attendance.photoUrl} 
                        alt="Foto da unidade" 
                        className="rounded-md max-h-48 object-contain mx-auto"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WeeklyAttendanceHistory;
