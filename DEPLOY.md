# Guia de Implantação (Deployment)

O **OptiNutri** é uma aplicação web moderna construída com Next.js. Ela foi projetada para ser leve e fácil de implantar.

## Estado Atual da Aplicação

- **Tipo**: Client-Side Application (Aplicação do Lado do Cliente).
- **Banco de Dados**: Utiliza `LocalStorage` do navegador e arquivos JSON estáticos. Não há banco de dados centralizado no momento.
- **Autenticação**: Não requer login (Acesso livre).

> **IMPORTANTE**: Como o banco de dados é local, **cada usuário vê apenas suas próprias alterações**. Se o Usuário A alterar o preço de uma fórmula, o Usuário B **não** verá essa mudança, pois ela fica salva apenas no navegador do Usuário A.

## Como Colocar na Nuvem (Usuários Externos)

A maneira mais fácil e recomendada de colocar este projeto online é usando a **Vercel** (criadores do Next.js).

### Opção 1: Vercel (Recomendado)

1. Crie uma conta em [vercel.com](https://vercel.com).
2. Instale a Vercel CLI no seu terminal:

   ```bash
   npm i -g vercel
   ```

3. Na pasta do projeto, rode:

   ```bash
   vercel
   ```

4. Siga as instruções na tela (aceite os padrões pressionando Enter).
5. Em instantes, você receberá um link (ex: `optinutri.vercel.app`) que pode ser enviado para qualquer usuário externo.

### Opção 2: Netlify ou Outros

Como é um projeto Next.js padrão, pode ser implantado em qualquer host que suporte Node.js ou Static Exports.

## Próximos Passos (Caso precise de Centralização)

Se no futuro você precisar que as edições de um usuário (ex: Gestor) sejam vistas por todos os outros usuários, será necessário:

1. Ativar um banco de dados real (PostgreSQL, Firebase, Supabase).
2. Implementar um sistema de Login.
3. Migrar a lógica de `atomWithStorage` (local) para chamadas de API (nuvem).

O projeto já contém configurações preparatórias para Firebase, mas **não as está utilizando** nesta versão para manter a simplicidade e rapidez.
