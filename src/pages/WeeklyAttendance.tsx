
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { useAppContext } from '../contexts/AppContext';
import { useToast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { Clock, User, Shirt, Flag, Book, Upload, Image, AlertCircle } from 'lucide-react';
import { Award } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type FormValues = {
  presentMembers: string;
  punctualCount: number;
  neckerchiefCount: number;
  uniformCount: number;
  broughtFlag: boolean;
  broughtBible: boolean;
};

const WeeklyAttendance = () => {
  const { 
    currentUser, 
    units, 
    submitWeeklyAttendance, 
    isFormEnabledForUnit 
  } = useAppContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form setup
  const form = useForm<FormValues>({
    defaultValues: {
      presentMembers: '',
      punctualCount: 0,
      neckerchiefCount: 0,
      uniformCount: 0,
      broughtFlag: false,
      broughtBible: false,
    },
  });

  // Redirect if not logged in as unit
  React.useEffect(() => {
    if (!currentUser || currentUser.type !== 'unit') {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  if (!currentUser || currentUser.type !== 'unit' || !currentUser.unitId) {
    return null;
  }

  // Find current unit
  const currentUnit = units.find(u => u.id === currentUser.unitId);
  if (!currentUnit) return null;

  // Check if the form is enabled for this unit
  const formEnabled = isFormEnabledForUnit(currentUnit.id);

  // Handle file selection with validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setImageError("Tipo de arquivo inválido. Por favor, selecione uma imagem (JPEG, PNG, GIF, WEBP).");
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setImageError("Arquivo muito grande. O tamanho máximo permitido é 5MB.");
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  // Handle photo removal
  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: FormValues) => {
    // Prevent submission if form is disabled
    if (!formEnabled) {
      toast({
        title: "Formulário indisponível",
        description: "O formulário de presença não está habilitado no momento.",
        variant: "destructive",
      });
      return;
    }
    
    // Prevent multiple submissions
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    // Split the comma-separated names into an array and clean them
    const presentMemberArray = data.presentMembers
      .split(',')
      .map(name => name.trim())
      .filter(name => name !== '');

    // Calculate score based on attendance data
    const baseScore = presentMemberArray.length * 2; // 2 points per person
    const punctualityBonus = data.punctualCount * 1; // 1 point per punctual person
    const neckerchiefBonus = data.neckerchiefCount * 1; // 1 point per neckerchief
    const uniformBonus = data.uniformCount * 1; // 1 point per uniform
    const flagBonus = data.broughtFlag ? 5 : 0; // 5 points for flag
    const bibleBonus = data.broughtBible ? 5 : 0; // 5 points for bible
    
    const totalScore = baseScore + punctualityBonus + neckerchiefBonus + uniformBonus + flagBonus + bibleBonus;

    // Submit attendance data
    const success = await submitWeeklyAttendance({
      unitId: currentUnit.id,
      date: new Date().toISOString(),
      presentMembers: presentMemberArray,
      punctualCount: data.punctualCount,
      neckerchiefCount: data.neckerchiefCount,
      uniformCount: data.uniformCount,
      broughtFlag: data.broughtFlag,
      broughtBible: data.broughtBible,
      photoUrl: previewUrl || undefined,
      score: totalScore
    });

    if (success) {
      toast({
        title: "Presença semanal enviada!",
        description: "Sua presença foi registrada com sucesso.",
        variant: "default",
      });
      
      // Reset form
      form.reset();
      setSelectedFile(null);
      setPreviewUrl(null);
      setImageError(null);
      
      // Navigate to history
      navigate('/weekly-attendance-history');
    } else {
      toast({
        title: "Erro ao enviar presença",
        description: "Parece que você já registrou presença esta semana.",
        variant: "destructive",
      });
    }
    
    setIsSubmitting(false);
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 md:p-6 rounded-lg shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Registro de Presença</h1>
                <p className="text-base md:text-lg opacity-90">{currentUnit.name}</p>
              </div>
              <Button 
                size={isMobile ? "sm" : "default"}
                variant="secondary"
                onClick={() => navigate('/weekly-attendance-history')}
              >
                Ver Histórico
              </Button>
            </div>
          </div>
        </div>

        {!formEnabled ? (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center p-4 gap-3">
                <AlertCircle className="h-12 w-12 text-yellow-500" />
                <h2 className="text-xl font-semibold">Formulário Indisponível</h2>
                <p className="text-gray-600">
                  O formulário de presença não está disponível no momento. 
                  Por favor, aguarde até que o administrador o habilite.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => navigate('/unit-dashboard')}
                >
                  Voltar ao Painel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Presença Semanal</CardTitle>
              <CardDescription>
                Preencha os dados da presença de sua unidade para esta semana
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="presentMembers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="w-4 h-4 md:w-5 md:h-5" /> Membros Presentes
                        </FormLabel>
                        <FormControl>
                          <textarea
                            className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md"
                            placeholder="Digite os nomes dos membros presentes, separados por vírgula"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Liste os nomes separados por vírgula, ex: João, Maria, Pedro
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="punctualCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Clock className="w-4 h-4 md:w-5 md:h-5" /> Pontuais
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>
                            Número de membros que chegaram no horário
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="neckerchiefCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Award className="w-4 h-4 md:w-5 md:h-5" /> Lenço
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>
                            Número de membros usando o lenço
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="uniformCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Shirt className="w-4 h-4 md:w-5 md:h-5" /> Uniforme
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>
                            Número de membros com uniforme completo
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="broughtFlag"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                               <Checkbox
                                 checked={field.value}
                                 onCheckedChange={field.onChange}
                               />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="flex items-center gap-2">
                                <Flag className="w-4 h-4 md:w-5 md:h-5" /> bandeirim
                              </FormLabel>
                              <FormDescription>
                                A unidade trouxe o bandeirim?
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="broughtBible"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                               <Checkbox
                                 checked={field.value}
                                 onCheckedChange={field.onChange}
                               />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="flex items-center gap-2">
                                <Book className="w-4 h-4 md:w-5 md:h-5" /> Bíblia
                              </FormLabel>
                              <FormDescription>
                                A unidade trouxe bíblias?
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Photo Upload Section */}
                  <div className="border rounded-lg p-4 space-y-3">
                    <FormLabel className="flex items-center gap-2 text-base">
                      <Image className="w-4 h-4 md:w-5 md:h-5" /> Foto da Unidade
                    </FormLabel>
                    <FormDescription>
                      Adicione uma foto da unidade para registrar este encontro (opcional)
                    </FormDescription>
                    
                    {imageError && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Erro</AlertTitle>
                        <AlertDescription>{imageError}</AlertDescription>
                      </Alert>
                    )}
                    
                    {!previewUrl ? (
                      <div 
                        className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-8 w-8 mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500">Clique para selecionar uma foto</p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF ou WEBP (máx. 5MB)</p>
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          className="hidden" 
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          onChange={handleFileChange} 
                        />
                      </div>
                    ) : (
                      <div className="relative">
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="max-h-64 rounded-lg mx-auto object-contain"
                        />
                        <Button 
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={handleRemovePhoto}
                        >
                          Remover
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="w-full">
                            <Button 
                              type="submit" 
                              disabled={isSubmitting}
                              className="w-full"
                            >
                              {isSubmitting ? 'Enviando...' : 'Enviar Presença'}
                            </Button>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Registrar a presença da unidade</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default WeeklyAttendance;
