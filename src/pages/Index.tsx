
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppContext } from '../contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import Layout from '../components/Layout';
import { Loader2, BarChart3 } from 'lucide-react';
import PodiumStep from '@/components/PodiumStep';
import RankingItem from '@/components/RankingItem';
import { useLeaderboardData } from '@/hooks/useLeaderboardData';
import { usePositionTracker } from '@/hooks/usePositionTracker';

const Index = () => {
  const { units, currentUser, loading, rankingVisible } = useAppContext();
  
  const { sortedUnits, getRankWithTies } = useLeaderboardData(units);
  const { getPositionChange } = usePositionTracker(sortedUnits);

  if (loading) {
    return (
      <Layout>
        <div className="w-full h-[70vh] flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-gray-600">Carregando dados...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-2 md:px-4">
        {/* Header */}
        <motion.div 
          className="text-center mb-6 md:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 text-primary">
            Ranking Geral
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-gray-600">
            Veja como todas as unidades estão se saindo!
          </p>
        </motion.div>

        {units.length === 0 ? (
          <motion.div 
            className="text-center py-10 bg-gray-50 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-gray-600">Nenhuma unidade encontrada.</p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* 3D Podium for Top 3 - Conditional display */}
            {rankingVisible && sortedUnits.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="flex justify-center items-end gap-2 md:gap-4 lg:gap-8 mb-6 md:mb-8"
              >
                {/* 2nd Place (Left) */}
                {sortedUnits[1] && (
                  <PodiumStep
                    unit={sortedUnits[1]}
                    position={2}
                    isCurrentUnit={currentUser?.type === 'unit' && currentUser.unitId === sortedUnits[1].id}
                    delay={0.2}
                  />
                )}

                {/* 1st Place (Center) */}
                {sortedUnits[0] && (
                  <PodiumStep
                    unit={sortedUnits[0]}
                    position={1}
                    isCurrentUnit={currentUser?.type === 'unit' && currentUser.unitId === sortedUnits[0].id}
                    delay={0}
                  />
                )}

                {/* 3rd Place (Right) */}
                {sortedUnits[2] && (
                  <PodiumStep
                    unit={sortedUnits[2]}
                    position={3}
                    isCurrentUnit={currentUser?.type === 'unit' && currentUser.unitId === sortedUnits[2].id}
                    delay={0.4}
                  />
                )}
              </motion.div>
            )}

            {/* Complete Ranking List - Conditional display */}
            {rankingVisible ? (
              <Card>
                <CardContent className="p-3 md:p-4 lg:p-6">
                  <motion.h2 
                    className="text-lg md:text-xl font-bold mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    Classificação Completa
                  </motion.h2>
                  <motion.div 
                    className="space-y-1 md:space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    {sortedUnits.map((unit, index) => {
                      const position = getRankWithTies(index);
                      const isCurrentUnit = currentUser?.type === 'unit' && currentUser.unitId === unit.id;
                      const positionChange = getPositionChange(unit.id);
                      
                      return (
                        <RankingItem
                          key={unit.id}
                          unit={unit}
                          position={position}
                          isCurrentUnit={isCurrentUnit}
                          index={index}
                          positionChange={positionChange}
                        />
                      );
                    })}
                  </motion.div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 md:p-12 text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col items-center gap-6"
                  >
                    <BarChart3 className="w-20 h-20 md:w-24 md:h-24 text-gray-400" />
                    <div className="space-y-2">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-700">
                        Ranking Temporariamente Indisponível
                      </h3>
                      <p className="text-sm md:text-base text-gray-500 max-w-md mx-auto">
                        O ranking geral está temporariamente oculto. Entre em contato com o administrador para mais informações.
                      </p>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            )}
            
            {/* Login Prompt for Non-authenticated Users */}
            {!currentUser && (
              <motion.div 
                className="text-center mt-6 md:mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
              >
                <Link 
                  to="/login" 
                  className="bg-primary text-white px-4 py-3 md:px-6 md:py-3 rounded-md text-base md:text-lg font-medium hover:bg-opacity-90 transition-all"
                >
                  Entrar na Sua Unidade
                </Link>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Index;
