-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 07/05/2025 às 03:38
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `chatnode`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `chats`
--

CREATE TABLE `chats` (
  `idChat` int(11) NOT NULL,
  `nomeChat` varchar(255) DEFAULT NULL,
  `createdAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `chat_messages`
--

CREATE TABLE `chat_messages` (
  `id` int(11) NOT NULL,
  `idChat` int(11) NOT NULL,
  `idUser` int(11) NOT NULL,
  `mensagem` text DEFAULT NULL,
  `link` tinyint(4) DEFAULT 0,
  `replyTo` int(11) DEFAULT NULL,
  `mediaUrl` varchar(500) DEFAULT NULL,
  `nomeDocs` varchar(255) DEFAULT NULL,
  `createdAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `chat_participants`
--

CREATE TABLE `chat_participants` (
  `id` int(11) NOT NULL,
  `idChat` int(11) NOT NULL,
  `idUser` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `contatos`
--

CREATE TABLE `contatos` (
  `idUser` int(11) NOT NULL,
  `idContato` int(11) NOT NULL,
  `nomeContato` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `grupos`
--

CREATE TABLE `grupos` (
  `id` int(11) NOT NULL,
  `nomeGrupo` varchar(500) NOT NULL,
  `imgGrupo` varchar(500) NOT NULL,
  `idChat` int(11) DEFAULT NULL,
  `descricaoGrupo` varchar(1000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `status`
--

CREATE TABLE `status` (
  `id` int(11) NOT NULL,
  `idAutor` int(11) NOT NULL,
  `nomeAutor` varchar(100) NOT NULL,
  `imgStatus` varchar(500) NOT NULL,
  `legenda` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `status`
--

INSERT INTO `status` (`id`, `idAutor`, `nomeAutor`, `imgStatus`, `legenda`) VALUES
(25, 1, 'Eduardo Franco', 'upload\\status\\1\\1745007896122.png', 'teste'),
(26, 1, 'Eduardo Franco', 'upload\\status\\1\\1745007943199.png', 'a'),
(27, 1, 'Eduardo Franco', 'upload\\status\\1\\1745007995965.mp4', 'teste video'),
(28, 2, 'Igor IA', 'upload\\status\\2\\1745008062347.jpg', 'a'),
(29, 4, 'Pinguim', 'upload\\status\\4\\1745008131994.jpg', 'a'),
(39, 12, 'Leonardo Silva', 'upload\\status\\12\\1746569001227.jpg', NULL),
(40, 2, 'Igor IA', 'upload\\status\\2\\1746570632296.jpg', 'setup'),
(41, 2, 'Igor IA', 'upload\\status\\2\\1746570641561.jpg', NULL),
(42, 2, 'Igor IA', 'upload\\status\\2\\1746570653063.jpg', NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuario`
--

CREATE TABLE `usuario` (
  `id` int(11) NOT NULL,
  `nome` varchar(500) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(100) NOT NULL,
  `img` varchar(500) NOT NULL,
  `descricao` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `usuario`
--

INSERT INTO `usuario` (`id`, `nome`, `email`, `senha`, `img`, `descricao`) VALUES
(1, 'Eduardo Franco', 'efs2437@gmail.com', 'Games14700.', '1745007818324.png', 'Teste3'),
(2, 'Igor IA', 'igor123@gmail.com', 'Teste123.', '1745007848318.png', 'meu nome é igor'),
(3, 'Marcos', 'marcos_s1@gmail.com', 'Teste1234.', '1745950976589.png', 'Teste2'),
(4, 'Pinguim', 'pinguim@gmail.com', 'Teste1234.', '1745008122256.png', ''),
(7, 'NewTeste1', 'newteste1@gmail.com', 'Teste12345.', '1746034960308.png', ''),
(8, 'Newteste2', 'newteste2@gmail.com', 'Teste12345.', 'iconePadrao.svg', ''),
(9, 'Newteste3', 'newteste3@gmail.com', 'Teste12345.', 'iconePadrao.svg', ''),
(10, 'Newteste4', 'newteste4@gmail.com', 'Teste1234.', 'iconePadrao.svg', ''),
(12, 'Leonardo Silva', 'leosilva_od@gmail.com', 'Teste1234.', '1746568024493.png', 'Descricao');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `chats`
--
ALTER TABLE `chats`
  ADD PRIMARY KEY (`idChat`);

--
-- Índices de tabela `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_chat_message_chat` (`idChat`),
  ADD KEY `fk_chat_message_user` (`idUser`);

--
-- Índices de tabela `chat_participants`
--
ALTER TABLE `chat_participants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_participation` (`idChat`,`idUser`),
  ADD KEY `fk_participants_users` (`idUser`);

--
-- Índices de tabela `grupos`
--
ALTER TABLE `grupos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_grupo_chat` (`idChat`);

--
-- Índices de tabela `status`
--
ALTER TABLE `status`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `chats`
--
ALTER TABLE `chats`
  MODIFY `idChat` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT de tabela `chat_messages`
--
ALTER TABLE `chat_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `chat_participants`
--
ALTER TABLE `chat_participants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `grupos`
--
ALTER TABLE `grupos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `status`
--
ALTER TABLE `status`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT de tabela `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD CONSTRAINT `fk_chat_message_chat` FOREIGN KEY (`idChat`) REFERENCES `chats` (`idChat`),
  ADD CONSTRAINT `fk_chat_message_user` FOREIGN KEY (`idUser`) REFERENCES `usuario` (`id`);

--
-- Restrições para tabelas `chat_participants`
--
ALTER TABLE `chat_participants`
  ADD CONSTRAINT `fk_participants_chats` FOREIGN KEY (`idChat`) REFERENCES `chats` (`idChat`),
  ADD CONSTRAINT `fk_participants_users` FOREIGN KEY (`idUser`) REFERENCES `usuario` (`id`);

--
-- Restrições para tabelas `grupos`
--
ALTER TABLE `grupos`
  ADD CONSTRAINT `fk_grupo_chat` FOREIGN KEY (`idChat`) REFERENCES `chats` (`idChat`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
