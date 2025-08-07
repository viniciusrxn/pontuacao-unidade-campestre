# API Reference - Ranking Unidade

## Visão Geral

Esta documentação descreve todas as operações da API disponíveis no sistema Ranking Unidade, utilizando Supabase como backend.

## Base URL
```
https://tmhkprlaefcqlgxjgkqp.supabase.co
```

## Autenticação

O sistema utiliza autenticação personalizada através de stored procedures no Supabase.

### Admin Login
```typescript
POST /rest/v1/rpc/authenticate_admin

Body:
{
  "username_param": "admin",
  "password_param": "sua_senha"
}

Response:
{
  "success": true,
  "admin_id": "uuid",
  "username": "admin"
}
```

### Unit Login
```typescript
POST /rest/v1/rpc/authenticate_unit

Body:
{
  "unit_name_param": "Nome da Unidade",
  "password_param": "senha_da_unidade"
}

Response:
{
  "success": true,
  "unit_id": "uuid",
  "unit_name": "Nome da Unidade",
  "unit_score": 150
}
```

## Endpoints

### Units

#### GET /rest/v1/units
Buscar todas as unidades (Admin only)

```typescript
GET /rest/v1/units?select=*&order=score.desc,name.asc

Response:
[
  {
    "id": "uuid",
    "name": "Unidade Alpha",
    "score": 250,
    "logo": "https://...",
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

#### PUT /rest/v1/units
Atualizar dados da unidade

```typescript
PUT /rest/v1/units?id=eq.{unit_id}

Body:
{
  "score": 300,
  "logo": "nova_url_logo"
}
```

### Tasks

#### GET /rest/v1/tasks
Buscar tarefas ativas

```typescript
GET /rest/v1/tasks?status=eq.active&order=created_at.desc

Response:
[
  {
    "id": "uuid",
    "title": "Tarefa Exemplo",
    "description": "Descrição da tarefa",
    "points": 50,
    "deadline": "2025-01-31T23:59:59Z",
    "status": "active",
    "difficulty": "medium",
    "category": "geral",
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

#### POST /rest/v1/tasks
Criar nova tarefa (Admin only)

```typescript
POST /rest/v1/tasks

Body:
{
  "title": "Nova Tarefa",
  "description": "Descrição detalhada",
  "points": 75,
  "deadline": "2025-02-15T23:59:59Z",
  "difficulty": "hard",
  "category": "outdoor"
}
```

#### DELETE /rest/v1/tasks
Deletar tarefa (Admin only)

```typescript
DELETE /rest/v1/tasks?id=eq.{task_id}
```

### Task Submissions

#### GET /rest/v1/task_submissions
Buscar submissões

```typescript
// Para unidade (próprias submissões)
GET /rest/v1/task_submissions?unit_id=eq.{unit_id}

// Para admin (todas as submissões)
GET /rest/v1/task_submissions?select=*,tasks(title),units(name)

Response:
[
  {
    "id": "uuid",
    "task_id": "uuid",
    "unit_id": "uuid",
    "proof": "Descrição da prova",
    "status": "pending",
    "submitted_at": "2025-01-15T10:30:00Z"
  }
]
```

#### POST /rest/v1/task_submissions
Submeter tarefa (Unit only)

```typescript
POST /rest/v1/task_submissions

Body:
{
  "task_id": "uuid",
  "unit_id": "uuid",
  "proof": "Evidência da conclusão da tarefa"
}
```

#### PUT /rest/v1/task_submissions
Validar submissão (Admin only)

```typescript
PUT /rest/v1/task_submissions?id=eq.{submission_id}

Body:
{
  "status": "completed" // ou "rejected"
}
```

### Weekly Attendances

#### GET /rest/v1/weekly_attendances
Buscar presenças semanais

```typescript
// Para unidade
GET /rest/v1/weekly_attendances?unit_id=eq.{unit_id}&order=date.desc

// Para admin
GET /rest/v1/weekly_attendances?select=*,units(name)&order=date.desc

Response:
[
  {
    "id": "uuid",
    "unit_id": "uuid",
    "date": "2025-01-15T00:00:00Z",
    "present_members": ["João", "Maria", "Pedro"],
    "punctual_count": 2,
    "neckerchief_count": 3,
    "uniform_count": 3,
    "brought_flag": true,
    "brought_bible": false,
    "photo_url": "https://...",
    "score": 25,
    "status": "pending",
    "submitted_at": "2025-01-15T19:30:00Z"
  }
]
```

#### POST /rest/v1/weekly_attendances
Submeter presença semanal (Unit only)

```typescript
POST /rest/v1/weekly_attendances

Body:
{
  "unit_id": "uuid",
  "date": "2025-01-15T00:00:00Z",
  "present_members": ["João", "Maria", "Pedro"],
  "punctual_count": 2,
  "neckerchief_count": 3,
  "uniform_count": 3,
  "brought_flag": true,
  "brought_bible": false,
  "photo_url": "https://imgur.com/example.jpg",
  "score": 25
}
```

#### PUT /rest/v1/weekly_attendances
Validar presença (Admin only)

```typescript
PUT /rest/v1/weekly_attendances?id=eq.{attendance_id}

Body:
{
  "status": "validated" // ou "rejected"
}
```

### News Feed

#### GET /rest/v1/news_feed
Buscar notícias

```typescript
GET /rest/v1/news_feed?status=eq.published&order=is_pinned.desc,created_at.desc

Response:
[
  {
    "id": "uuid",
    "title": "Título da Notícia",
    "content": "Conteúdo da notícia...",
    "author_type": "admin",
    "is_pinned": false,
    "status": "published",
    "created_at": "2025-01-15T12:00:00Z",
    "updated_at": "2025-01-15T12:00:00Z"
  }
]
```

#### POST /rest/v1/news_feed
Criar notícia (Admin only)

```typescript
POST /rest/v1/news_feed

Body:
{
  "title": "Nova Notícia",
  "content": "Conteúdo detalhado da notícia",
  "is_pinned": false,
  "status": "published"
}
```

#### DELETE /rest/v1/news_feed
Deletar notícia (Admin only)

```typescript
DELETE /rest/v1/news_feed?id=eq.{news_id}
```

### Polls

#### GET /rest/v1/polls
Buscar enquetes

```typescript
GET /rest/v1/polls?status=in.(active,closed)&order=created_at.desc

Response:
[
  {
    "id": "uuid",
    "title": "Título da Enquete",
    "description": "Descrição opcional",
    "options": [
      {"id": "1", "text": "Opção 1"},
      {"id": "2", "text": "Opção 2"}
    ],
    "allow_multiple_votes": false,
    "status": "active",
    "expires_at": "2025-01-31T23:59:59Z",
    "created_at": "2025-01-15T12:00:00Z"
  }
]
```



### Form Settings

#### GET /rest/v1/form_settings
Buscar configurações de formulários (Admin only)

```typescript
GET /rest/v1/form_settings

Response:
[
  {
    "id": "uuid",
    "form_type": "weekly_attendance",
    "is_enabled": true,
    "enabled_units": ["uuid1", "uuid2"],
    "updated_at": "2025-01-15T12:00:00Z"
  }
]
```

#### PUT /rest/v1/form_settings
Atualizar configurações (Admin only)

```typescript
PUT /rest/v1/form_settings?form_type=eq.weekly_attendance

Body:
{
  "is_enabled": true,
  "enabled_units": ["uuid1", "uuid2"]
}
```

## Stored Procedures (RPC)

### Unit Management

#### create_new_unit
```typescript
POST /rest/v1/rpc/create_new_unit

Body:
{
  "name_param": "Nova Unidade",
  "password_param": "senha123"
}

Response: "uuid" // ID da nova unidade
```

#### update_unit_password
```typescript
POST /rest/v1/rpc/update_unit_password

Body:
{
  "unit_id_param": "uuid",
  "new_password_param": "nova_senha"
}

Response: true/false
```

#### delete_unit
```typescript
POST /rest/v1/rpc/delete_unit

Body:
{
  "unit_id_param": "uuid"
}

Response: true/false
```

#### is_form_enabled_for_unit
```typescript
POST /rest/v1/rpc/is_form_enabled_for_unit

Body:
{
  "form_name": "weekly_attendance",
  "unit_id": "uuid"
}

Response: true/false
```

## Real-time Subscriptions

### Listening to Changes

```typescript
// Mudanças nas unidades
supabase
  .channel('units-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'units'
  }, (payload) => {
    console.log('Unit changed:', payload);
  })
  .subscribe();

// Novas submissões de tarefas
supabase
  .channel('submissions-changes')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'task_submissions'
  }, (payload) => {
    console.log('New submission:', payload);
  })
  .subscribe();

// Novas notícias
supabase
  .channel('news-changes')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'news_feed'
  }, (payload) => {
    console.log('New news:', payload);
  })
  .subscribe();
```

## Error Handling

### Códigos de Status HTTP

- **200** - Success
- **201** - Created
- **400** - Bad Request
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **406** - Not Acceptable (RLS violation)
- **409** - Conflict
- **500** - Internal Server Error

### Error Response Format

```typescript
{
  "code": "23505",
  "details": "Key (name)=(Unidade Teste) already exists.",
  "hint": null,
  "message": "duplicate key value violates unique constraint \"units_name_key\""
}
```

## Rate Limiting

O Supabase aplica rate limiting baseado no plano:

- **Free Tier**: 100 requests/minute
- **Pro Tier**: 700 requests/minute

## Best Practices

### 1. Use Select Específico
```typescript
// ❌ Evitar
.select('*')

// ✅ Preferir
.select('id, name, score')
```

### 2. Filtros Eficientes
```typescript
// ✅ Usar índices
.eq('status', 'active')
.order('created_at', { ascending: false })
.limit(10)
```

### 3. Tratamento de Erros
```typescript
const { data, error } = await supabase
  .from('units')
  .select('*');

if (error) {
  console.error('Database error:', error);
  // Tratar erro apropriadamente
  return;
}

// Usar dados
console.log(data);
```

### 4. Real-time Cleanup
```typescript
useEffect(() => {
  const subscription = supabase
    .channel('changes')
    .on('postgres_changes', {}, handler)
    .subscribe();

  // Cleanup
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

## Security Notes

1. **Row Level Security (RLS)** está ativado em todas as tabelas
2. **Stored procedures** são executados com SECURITY DEFINER
3. **Políticas específicas** controlam acesso por tipo de usuário
4. **Senhas** são hash com bcrypt (tabela admin_credentials)
5. **Validação** de entrada em todos os endpoints

---

*API Reference atualizada em: Janeiro 2025* 