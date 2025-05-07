# Real Time Chat

## Introdução
<div align="justify">
  
  Este é um projeto de um chat em tempo real semelhante ao whatsapp, onde o foco dele foi treinar minha lógica em aplicação `full stack` e principalmente na logica `back-end` da criação de um chat de conversas em tempo real, o que foi um grande desafio, sem duvida maior projeto em escala de arquivos e linhas que já realizei!
</div>

   ## Detalhes do Projeto

  <div align="justify">
    
  No sistema após passar pela tela de `login` ou `sing up` o usuário irá para tela `home` aonde terá um menu vertical no canto direito da tela o qual tem os detalhes da sua conta, lista de contatos e grupos, botão de adicionar novo contato ou grupo, o menu também tem duas abas a de dados da conta aonde pode editar seus dados pessoais, e a aba de status a qual pode visualizar seus status postar novos ou ver status da sua lista de contatos. Após terá o container do chata o qual quando selecionar um contato ou grupo na lista ele abra o chat de conversar nessa parte temos um header nele tem opções e se apertar na foto do contato ou grupo ele abrirá a aba de detalhes do chat aonde se for um grupo pode editar os detalhes e adicionar membros novos e se for um contato pode visualizar os dados dele. Agora o chat em si carrega as ultimas mensagens enviadas e conforme for subindo a tela ele vai carregando as mensagens mais antigas, todas separada pelas data de envio. O usuário pode mandar mensagens de texto, áudio, arquivo, imagens ou vídeo e links, as próprias mensagens ele pode tem opções como excluir, editar, responder, etc. O sistema esta todo responsivo para diferentes telas.
</div>
 <div align="center">
     <h1>Imagens do Projeto</h1>
    <br>
    <br>
    <img src="/imagensDemo/container.jpeg">
    <br>
    <br>
     <img src="/imagensDemo/status.jpeg">  
    <br>
    <br>
     <img src="/imagensDemo/mobile.png">  
    <br>
    <br>
 </div>
   <div align="start">
    
   ## Detalhes do Codigo
  </div>  
   <div align="justify">
     
   Já para realizar essa aplicação utilizei o `React.js` juntamente com `Node.js`, `TypeScript` e o banco de dados em `MySQL`, o projeto está bem estruturado e organizado, optei por organizar as pastas por componentes e cada componente tem seu hooks, services, types específicos assim facilitando a localização já que o projeto esta grande com muitos arquivos, no `back-end` do projeto estou usando o comando `SQL` diretamente optei por não utilizar uma biblioteca como o _prisma_, pois queria praticar ainda mais meus conhecimento na escrita do `SQL`. Toda logica do chat foi feita do zero então não uso `APIs` para facilitar a comunicação eu salvo e consulto todos os dados diretamente do meu banco de dados. Implementei sistema de validação, socket para atualização das requisições em tempo real para não precisar atualizar a pagina para ver novos dados, e no front end toda a manipulação de `services` e `hooks` para controlar as requisições das minhas `APIs`, Projeto mesmo não tento tantas funcionalidades demorou bastante para realizá-lo aprendi muitas novidades, aprendi melhor usar o `TypeScript` e treina minha lógica em projetos complexos e grandes, tendo que solucionar diversos bugs ao longe do desenvolvimento. Projeto finalizado passa de 10mil linha de código tirando todas bibliotecas e arquivos padrões do `Node`. E no `front-end` realizei vários validações tratamentos de erros e principalmente logica para melhorara performance da aplicação, como usar o Suspense do React para não carregar dados antes da visualização e outros diversos tratamentos.  
 
 <div align="center">
    <br>
    <br>
    <img src="/imagensDemo/frontend.jpeg">
    <br>
    <br>
    <img src="/imagensDemo/backend.jpeg">
    <br>
    <br>
</div>
<br>
<p align="justify">


### Desafios Encontrados
<div align="justify">
  
  Um dos principais desafios enfrentados foi a necessidade de um domínio online para consumir a API `webhook`. Após extensas pesquisas, optei por utilizar o `Ngrok`, que possibilitou a criação de um túnel do ambiente `localhost`, permitindo que as requisições fossem acessíveis na web e que todos os testes necessários fossem realizados.

  Outro desafio significativo foi a implementação da lógica de auto login, que integra a validação dos streaks dos usuários com o cálculo da experiência. Essa solução garantiu a correta contagem dos dias consecutivos de acesso (desconsiderando os domingos) e impediu que o streak fosse incrementado mais de uma vez por dia, entre outras validações detalhadas.
</div>

### Melhoria para o futuro

<div align="justify">
  
 Atualmente o projeto está bem grande complexo e foi um excelente desafio para mim, mais ainda falta muitas opções como visualização, premiações nos grupos, ter as mídias de cada contato entro outros ajustes, mais atualmente estou postando ele assim e agora começara a realizar projetos cada vez maiores e melhorando cada vez mais minha lógica e sempre buscando e estudando novas tecnologia.  
</div>
<br>

  # Como Instalar?

  Apos abaixar o arquivo do projeto, instale as dependências usando esse comando

    npm i

  Com isso já é possível rodar o projeto para isso rode mais esse comando em um `terminar` dentro da pasta: 

    npm run dev 
    
  Agora em outro `terminar` também dentro da pasta, use esse comando:
  
    npm run server

  Com isso você pode testar no modo desenvolvedor o projeto infelizmente não tenho ele hospedado para testes!


<br>
<br>

<div align="center" style="display: inline_block">
  <br>
  <p>Linguagens utilizadas para a aplicação</p>

  <img align="center" alt="vitejs" height="30" width="40" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vitejs/vitejs-original.svg" />
  <img align="center" alt="react" height="30" width="40" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" />
  <img align="center" alt="mysql" height="30" width="40" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-plain-wordmark.svg" />
  <img align="center" alt="nodejs" height="30" width="40" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original-wordmark.svg" />
  <img align="center" alt="typescript" height="30" width="40" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg" />

</div>
<br>

<div align="start">
  
## Desenvolvedor

- **Eduardo Franco Seco:**  
  <a href="https://github.com/eduardofranco572" align="center">
    <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white">
  </a>
  <a href="https://www.linkedin.com/in/eduardo-franco572/" align="center">
    <img src="https://img.shields.io/badge/-LinkedIn-%230077B5?style=for-the-badge&logo=linkedin&logoColor=white" target="_blank">
  </a>  

</div>
