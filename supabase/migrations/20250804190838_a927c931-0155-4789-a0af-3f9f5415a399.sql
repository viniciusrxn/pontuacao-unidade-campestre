-- Create a sample task for testing
INSERT INTO public.tasks (title, description, points, deadline, difficulty, category, status)
VALUES 
('Primeira Tarefa de Teste', 'Esta é uma tarefa de teste para verificar se o sistema está funcionando corretamente. Complete qualquer atividade do clube e envie uma foto como prova.', 10, NOW() + INTERVAL '7 days', 'easy', 'geral', 'active');