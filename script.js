// --- CONFIGURAÇÃO E DADOS ---

// 1. Lista Completa de Concursos (Metadata)
const concursosData = [
    {
        id: 'camara-2026',
        title: 'Câmara dos Deputados',
        description: 'Técnico e Analista Legislativo. Maior remuneração do legislativo.',
        tags: ['<i class="fa-solid fa-fire"></i> Aberto', 'Superior', 'R$ 26k+'],
        totalModules: 10,
        totalQuizzes: 500,
        type: 'legislativo'
    },
    {
        id: 'caixa-2026',
        title: 'Caixa Econômica',
        description: 'Técnico Bancário e TI. Vagas para todo o Brasil.',
        tags: ['<i class="fa-solid fa-fire"></i> Aberto', 'Médio', 'R$ 6k+'],
        totalModules: 6,
        totalQuizzes: 300,
        type: 'bancario'
    },
    {
        id: 'ebserh-2026',
        title: 'Ebserh Nacional',
        description: 'Área da Saúde e Administrativa. Vagas hospitalares.',
        tags: ['<i class="fa-solid fa-user-doctor"></i> Aberto', 'Médio/Sup', 'R$ 11k+'],
        totalModules: 5,
        totalQuizzes: 250,
        type: 'admin'
    },
    {
        id: 'pf-2026',
        title: 'Polícia Federal',
        description: 'Agente, Escrivão e Papiloscopista. Carreira Policial de Elite.',
        tags: ['<i class="fa-solid fa-user-shield"></i> Previsto', 'Superior', 'R$ 14k+'],
        totalModules: 12,
        totalQuizzes: 600,
        type: 'policial'
    },
    {
        id: 'prf-2026',
        title: 'Polícia Rodoviária Federal',
        description: 'Policial Rodoviário. Operações em rodovias federais.',
        tags: ['<i class="fa-solid fa-car-side"></i> Previsto', 'Superior', 'R$ 12k+'],
        totalModules: 10,
        totalQuizzes: 500,
        type: 'policial'
    },
    {
        id: 'tse-2026',
        title: 'TSE Unificado',
        description: 'Vagas para TREs de todo o país. Técnico e Analista Judiciário.',
        tags: ['<i class="fa-solid fa-scale-balanced"></i> Previsto', 'Superior', 'R$ 9k+'],
        totalModules: 8,
        totalQuizzes: 400,
        type: 'tribunal'
    },
    {
        id: 'inss-2026',
        title: 'INSS',
        description: 'Técnico do Seguro Social. Foco em Direito Previdenciário.',
        tags: ['<i class="fa-solid fa-person-cane"></i> Previsto', 'Médio', 'R$ 7k+'],
        totalModules: 6,
        totalQuizzes: 300,
        type: 'admin'
    },
    {
        id: 'correios-2026',
        title: 'Correios',
        description: 'Agente de Correios (Carteiro e Atendente). Edital iminente.',
        tags: ['<i class="fa-solid fa-envelope"></i> Iminente', 'Médio', 'R$ 2.5k+'],
        totalModules: 4,
        totalQuizzes: 200,
        type: 'admin'
    },
    {
        id: 'bb-2026',
        title: 'Banco do Brasil',
        description: 'Escriturário - Agente Comercial. Carreira bancária.',
        tags: ['<i class="fa-solid fa-money-bill-wave"></i> Previsto', 'Médio', 'R$ 5.5k+'],
        totalModules: 6,
        totalQuizzes: 300,
        type: 'bancario'
    },
    {
        id: 'receita-2026',
        title: 'Receita Federal',
        description: 'Auditor Fiscal e Analista Tributário.',
        tags: ['<i class="fa-solid fa-file-invoice-dollar"></i> Previsto', 'Superior', 'R$ 21k+'],
        totalModules: 15,
        totalQuizzes: 750,
        type: 'fiscal'
    },
    {
        id: 'mpu-2026',
        title: 'MPU',
        description: 'Ministério Público da União. Técnico e Analista.',
        tags: ['<i class="fa-solid fa-gavel"></i> Previsto', 'Superior', 'R$ 10k+'],
        totalModules: 9,
        totalQuizzes: 450,
        type: 'tribunal'
    },
    {
        id: 'bacen-2026',
        title: 'Banco Central (BACEN)',
        description: 'Analista. Foco e Economia e Finanças.',
        tags: ['<i class="fa-solid fa-building-columns"></i> Previsto', 'Superior', 'R$ 20k+'],
        totalModules: 10,
        totalQuizzes: 500,
        type: 'bancario'
    },
    {
        id: 'ibama-2026',
        title: 'IBAMA / ICMBio',
        description: 'Analista Ambiental. Proteção e fiscalização ambiental.',
        tags: ['<i class="fa-solid fa-tree"></i> Previsto', 'Superior', 'R$ 9k+'],
        totalModules: 7,
        totalQuizzes: 350,
        type: 'ambiental'
    }
];

// 2. Gerador de Conteúdo Gigante & Educativo
const QuestionGenerator = {
    templates: {
        'portugues': [
            { t: 'Na frase "O servidor _[VERB_P]_ o edital", qual a função sintática de "o edital"?', a: ['Objeto Direto', 'Objeto Indireto', 'Sujeito', 'Adjunto Adverbial'], e: 'O termo "o edital" completa o sentido do verbo transitivo direto sem preposição.' },
            { t: 'Assinale a palavra escrita corretamente:', a: ['Exceção', 'Ecessão', 'Esceção', 'Ecceção'], e: 'A palavra "Exceção" grafada com X e Ç vem do latim exceptio.' },
            { t: 'Qual a conjugação do verbo _[VERB_P]_ no Futuro do Pretérito?', a: ['_VERB_ROOT_ia', '_VERB_ROOT_arei', '_VERB_ROOT_ava', '_VERB_ROOT_asse'], e: 'O Futuro do Pretérito usa a desinência "-ia" (ex: estudaria).' },
            { t: 'A palavra "Inconstitucional" é formada por qual processo?', a: ['Derivação Prefixal', 'Derivação Sufixal', 'Composição', 'Hibridismo'], e: 'Prefixo "In" adicionado à palavra Constitucional.' },
            { t: 'Em "Casa de ferreiro, espeto de pau", temos qual figura de linguagem?', a: ['Metáfora', 'Metonímia', 'Hipérbole', 'Eufemismo'], e: 'Metáfora implícita sobre a contradição.' },
            { t: 'Qual destas palavras NÃO leva acento?', a: ['Raiz', 'Pólen', 'Hífen', 'Álbum'], e: 'Raiz (terminada em Z) não leva acento. O plural "Raízes" leva.' },
            { t: 'O sujeito da frase "Choveu muito ontem" é:', a: ['Inexistente', 'Oculto', 'Simples', 'Indeterminado'], e: 'Verbos que indicam fenômeno da natureza formam oração sem sujeito.' },
            { t: 'Qual o plural de "Cidadão"?', a: ['Cidadãos', 'Cidadões', 'Cidadães', 'Cidadaos'], e: 'Cidadão faz plural em Cidadãos.' },
            { t: 'O uso da crase é OBRIGATÓRIO em:', a: ['Às vezes', 'A pé', 'A partir', 'A ela'], e: '"Às vezes" é locução adverbial feminina.' },
            { t: 'Sinônimo de "Efêmero":', a: ['Passageiro', 'Eterno', 'Duradouro', 'Constante'], e: 'Efêmero significa algo que dura pouco.' },
            { t: 'Antônimo de "Altruísta":', a: ['Egoísta', 'Bondoso', 'Solidário', 'Filantropo'], e: 'Altruísta pensa nos outros; Egoísta pensa em si.' },
            { t: 'Em "Ele estudou, MAS não passou", a conjunção indica:', a: ['Adversidade', 'Adição', 'Conclusão', 'Explicação'], e: '"Mas" é conjunção adversativa.' },
            { t: 'Qual a regência correta do verbo "Assistir" (ver)?', a: ['Assistir ao filme', 'Assistir o filme', 'Assistir no filme', 'Assistir do filme'], e: 'No sentido de ver, Assistir é VTI (pede preposição A).' },
            { t: 'A palavra "Árvore" é:', a: ['Proparoxítona', 'Oxítona', 'Paroxítona', 'Monossílaba'], e: 'Todas as proparoxítonas são acentuadas.' },
            { t: 'O que é um Hiato?', a: ['Duas vogais juntas em sílabas diferentes', 'Duas vogais na mesma sílaba', 'Três vogais juntas', 'Consoante muda'], e: 'Ex: Sa-ú-de.' }
        ],
        'direito_const': [
            { t: 'Segundo a CF/88, é fundamento da República Federativa do Brasil:', a: ['A soberania', 'O voto censitário', 'A pena de morte', 'O intervencionismo'], e: 'Art. 1º: Soberania, Cidadania, Dignidade, Valores do Trabalho, Pluralismo.' },
            { t: 'O artigo 5º garante que todos são iguais perante a:', a: ['Lei', 'Sociedade', 'Justiça divina', 'Autoridade policial'], e: 'Art. 5º Caput: Todos são iguais perante a lei.' },
            { t: 'É livre a manifestação do pensamento, sendo vedado o:', a: ['Anonimato', 'Debate', 'Crítica', 'Elogio'], e: 'Art 5°, IV - vedado o anonimato.' },
            { t: 'A casa é asilo inviolável, nela podendo penetrar sem consentimento:', a: ['Em flagrante delito', 'A qualquer hora', 'Apenas de dia', 'Por ordem do vizinho'], e: 'Flagrante, desastre, socorro ou ordem judicial (dia).' },
            { t: 'Nenhum brasileiro será extraditado, SALVO o:', a: ['Naturalizado (crime comum antes)', 'Nato', 'Todos podem', 'Nenhum pode'], e: 'Brasileiro Nato nunca é extraditado.' },
            { t: 'O poder emana do povo, que o exerce por meio de:', a: ['Representantes eleitos ou diretamente', 'Apenas representantes', 'Apenas diretamente', 'Força militar'], e: 'Art 1º, Parágrafo único.' },
            { t: 'São Poderes da União, independentes e harmônicos:', a: ['Executivo, Legislativo e Judiciário', 'Executivo, Moderador e Judiciário', 'Civil, Militar e Eclesiástico', 'Federal, Estadual e Municipal'], e: 'Art 2º da CF/88.' },
            { t: 'A tortura é crime:', a: ['Inafiançável e insuscetível de graça', 'Afiançável', 'Prescritível', 'De menor potencial'], e: 'Tortura, Tráfico, Terrorismo e Hediondos (3TH) são inafiançáveis.' },
            { t: 'O Mandado de Segurança protege direito:', a: ['Líquido e certo', 'De ir e vir', 'De informação', 'Eleitoral'], e: 'MS = Direito líquido e certo não amparado por HC ou HD.' },
            { t: 'A educação é direito de todos e dever:', a: ['Do Estado e da família', 'Apenas do Estado', 'Apenas da família', 'Das ONGs'], e: 'Art 205.' },
            { t: 'São símbolos da República Federativa do Brasil:', a: ['Bandeira, Hino, Armas e Selo', 'Bandeira e Hino', 'Brasão e Faixa', 'Coroa e Cetro'], e: 'Art 13, § 1º.' },
            { t: 'A idade mínima para ser Presidente é:', a: ['35 anos', '30 anos', '21 anos', '18 anos'], e: 'Art 14, § 3º, VI, a.' },
            { t: 'O racismo é crime:', a: ['Inafiançável e impresscritível', 'Afiançável', 'Prescritível', 'Condicionado'], e: 'Racismo e Ação de Grupos Armados são Imprescritíveis.' },
            { t: 'A defesa da paz é um princípio das relações:', a: ['Internacionais', 'Interpessoais', 'Familiares', 'Trabalhistas'], e: 'Art 4º da CF/88.' },
            { t: 'Erradicar a pobreza é um:', a: ['Objetivo Fundamental', 'Fundamento', 'Princípio Internacional', 'Direito Social'], e: 'Art 3º: Objetivos (Verbos).' }
        ],
        'direito_adm': [
            { t: 'Qual destes é um princípio da Administração Pública (LIMPE)?', a: ['Impessoalidade', 'Interestadualidade', 'Imparcialidade Pessoal', 'Inovação'], e: 'LIMPE: Legalidade, Impessoalidade, Moralidade, Publicidade, Eficiência.' },
            { t: 'O ato administrativo que pode ser revogado por conveniência é:', a: ['Discricionário', 'Vinculado', 'Nulo', 'Inexistente'], e: 'Apenas atos discricionários podem ser revogados por mérito.' },
            { t: 'A responsabilidade civil do Estado é, em regra:', a: ['Objetiva', 'Subjetiva', 'Inexistente', 'Penal'], e: 'Teoria do Risco Administrativo (Independe de dolo/culpa).' },
            { t: 'O abuso de poder pode ocorrer por:', a: ['Excesso de poder ou Desvio de finalidade', 'Apenas excesso', 'Apenas desvio', 'Uso legítimo'], e: 'São as duas modalidades de abuso.' },
            { t: 'A investidura em cargo público depende de:', a: ['Aprovação em concurso', 'Indicação política', 'Sorteio', 'Herança'], e: 'Art 37, II da CF.' },
            { t: 'O prazo de validade do concurso público é de até:', a: ['2 anos, prorrogável', '1 ano fixo', '4 anos fixo', 'Indeterminado'], e: 'Até 2 anos, prorrogável uma vez por igual período.' },
            { t: 'Servidor estável só perde o cargo por:', a: ['Sentença, Processo Adm ou Avaliação', 'Vontade do chefe', 'Mudança de governo', 'Aposentadoria compulsória'], e: 'Art 41, § 1º.' },
            { t: 'A acumulação remunerada de cargos é, em regra:', a: ['Vedada', 'Permitida', 'Obrigatória', 'Livre'], e: 'Vedada, salvo exceções (professores, saúde...).' },
            { t: 'As autarquias possuem personalidade jurídica de direito:', a: ['Público', 'Privado', 'Misto', 'Internacional'], e: 'Autarquias são PJ de Direito Público.' },
            { t: 'Sociedades de Economia Mista são PJ de direito:', a: ['Privado', 'Público', 'Misto', 'Difuso'], e: 'Ex: Banco do Brasil. Direito Privado.' },
            { t: 'Qual atributo permite a execução direta pelo Estado?', a: ['Autoexecutoriedade', 'Presunção de veracidade', 'Tipicidade', 'Imperatividade'], e: 'Agir sem precisar do Judiciário antes.' },
            { t: 'A delegação de competência NÃO pode ocorrer para:', a: ['Atos normativos', 'Atos de gestão', 'Processos simples', 'Vistorias'], e: 'Vedada delegação de: Edição de atos normativos, decisão de recursos, competência exclusiva.' },
            { t: 'O estágio probatório dura:', a: ['3 anos', '2 anos', '1 ano', '5 anos'], e: 'Conforme CF e jurisprudência.' },
            { t: 'Princípio que exige transparência:', a: ['Publicidade', 'Moralidade', 'Eficiência', 'Legalidade'], e: 'Atos devem ser públicos.' },
            { t: 'A licitação é dispensável em caso de:', a: ['Guerra ou grave perturbação', 'Compra de material de escritório', 'Contratação de obra grande', 'Serviço comum'], e: 'Art 75 da Lei 14.133.' }
        ],
        'informatica': [
            { t: 'O atalho para fechar uma janela no Windows é:', a: ['Alt + F4', 'Ctrl + C', 'Alt + Tab', 'Ctrl + Z'], e: 'Alt + F4 encerra o programa atual.' },
            { t: 'Qual protocolo é usado para envio de e-mails?', a: ['SMTP', 'POP3', 'IMAP', 'HTTP'], e: 'SMTP (Sua Mensagem Tá Partindo) envia emails.' },
            { t: 'Qual é o "cérebro" do computador?', a: ['CPU', 'RAM', 'HD', 'Fonte'], e: 'Unidade Central de Processamento.' },
            { t: 'Memória volátil que perde dados ao desligar:', a: ['RAM', 'HD', 'SSD', 'ROM'], e: 'RAM é memória de acesso aleatório volátil.' },
            { t: 'O cadeado no navegador indica protocolo:', a: ['HTTPS', 'HTTP', 'FTP', 'HTML'], e: 'S de Secure (SSL/TLS).' },
            { t: 'Software malicioso que sequestra dados:', a: ['Ransomware', 'Spyware', 'Adware', 'Worm'], e: 'Ransom = Resgate.' },
            { t: 'Atalho para COLAR:', a: ['Ctrl + V', 'Ctrl + C', 'Ctrl + X', 'Ctrl + P'], e: 'V de "Vem colando".' },
            { t: 'Qual destes é um Sistema Operacional?', a: ['Linux', 'Office', 'Chrome', 'Python'], e: 'Linux é um Kernel/OS.' },
            { t: 'Extensão padrão do Word:', a: ['.docx', '.xlsx', '.pptx', '.pdf'], e: 'Docx é documento XML.' },
            { t: 'Dispositivo de SAÍDA:', a: ['Monitor', 'Teclado', 'Mouse', 'Microfone'], e: 'Monitor exibe a informação.' },
            { t: 'O que é Phishing?', a: ['Engenharia social para roubar dados', 'Pesca esportiva', 'Vírus de pendrive', 'Bloqueio de tela'], e: 'Email/Site falso se passando por legítimo.' },
            { t: 'Armazenamento nas nuvens refere-se a:', a: ['Cloud Computing', 'Fog Computing', 'Rain Computing', 'Sky Net'], e: 'Servidores remotos.' },
            { t: 'Ferramenta de busca do Google Chrome:', a: ['Google', 'Bing', 'Yahoo', 'DuckDuckGo'], e: 'Padrão.' },
            { t: 'Firewall serve para:', a: ['Filtrar tráfego de rede', 'Apagar incêndios', 'Acelerar o PC', 'Limpar vírus'], e: 'Barreira de segurança.' },
            { t: 'Backup significa:', a: ['Cópia de segurança', 'Voltar atrás', 'Atualização', 'Formatação'], e: 'Cópia para restauração.' }
        ],
        'bancario': [
            { t: 'O órgão responsável pela política monetária no Brasil é:', a: ['CMN', 'Banco do Brasil', 'Caixa', 'CVM'], e: 'O CMN é o órgão normativo máximo.' },
            { t: 'O que significa a sigla PIX?', a: ['Pagamento Instantâneo', 'Protocolo de Internet X', 'Pagamento Internacional X', 'Plataforma de Investimentos'], e: 'Sistema de pagamentos instantâneos do Bacen.' },
            { t: 'Quem emite Papel Moeda no Brasil?', a: ['Banco Central', 'CMN', 'Banco do Brasil', 'Casa da Moeda'], e: 'Competência exclusiva do Bacen (autorizado pelo CMN).' },
            { t: 'A taxa básica de juros da economia é:', a: ['Selic', 'CDI', 'TR', 'IPCA'], e: 'Definida pelo COPOM.' },
            { t: 'Principal índice de inflação oficial:', a: ['IPCA', 'IGP-M', 'INPC', 'IPC-Fipe'], e: 'Índice Nacional de Preços ao Consumidor Amplo.' },
            { t: 'Instituição que fiscaliza o mercado de capitais (Bolsa):', a: ['CVM', 'Bacen', 'Susep', 'Previc'], e: 'Comissão de Valores Mobiliários.' },
            { t: 'O que é Spread Bancário?', a: ['Diferença entre juros de captação e empréstimo', 'Lucro líquido do banco', 'Taxa de administração', 'Imposto sobre cheque'], e: 'Margem do banco.' },
            { t: 'Lavagem de dinheiro tem quantas fases?', a: ['3 (Colocação, Ocultação, Integração)', '2', '4', '1'], e: 'Placement, Layering, Integration.' },
            { t: 'Seguro de depósitos é garantido pelo:', a: ['FGC', 'Bacen', 'Tesouro Nacional', 'Febraban'], e: 'Fundo Garantidor de Créditos (até 250k).' },
            { t: 'Título público usado para combater inflação:', a: ['Vender Títulos', 'Comprar Títulos', 'Diminuir Juros', 'Imprimir dinheiro'], e: 'Vender títulos retira dinheiro de circulação.' }
        ],
        'matematica': [
            { t: 'Se um produto custa R$ 100 e tem desconto de 20%, qual o valor final?', a: ['R$ 80', 'R$ 90', 'R$ 85', 'R$ 20'], e: '100 - 20 = 80.' },
            { t: 'A negação lógica de "Todo político é honesto" é:', a: ['Algum político não é honesto', 'Nenhum político é honesto', 'Todo político é desonesto', 'Algum político é honesto'], e: 'Negação de Todo é "Algum não" ou "Pelo menos um não".' },
            { t: 'Qual o próximo número da sequência: 2, 4, 8, 16...?', a: ['32', '30', '24', '18'], e: 'Dobro do anterior (PG razão 2).' },
            { t: 'Raiz quadrada de 144:', a: ['12', '14', '11', '10'], e: '12 x 12 = 144.' },
            { t: 'Regra de três: Se 2 pedreiros fazem muro em 6 dias, 4 pedreiros fazem em:', a: ['3 dias', '12 dias', '4 dias', '2 dias'], e: 'Grandezas inversamente proporcionais. Mais gente, menos tempo.' },
            { t: 'Probabilidade de tirar cara numa moeda honesta:', a: ['50%', '25%', '100%', '0%'], e: '1/2.' },
            { t: 'Quanto é 10% de 500?', a: ['50', '5', '100', '10'], e: '500 / 10 = 50.' },
            { t: 'Num triângulo retângulo, o quadrado da hipotenusa é igual a:', a: ['Soma dos quadrados dos catetos', 'Soma dos catetos', 'Dobro dos catetos', 'Produto dos catetos'], e: 'Teorema de Pitágoras.' },
            { t: 'Se A > B e B > C, então:', a: ['A > C', 'C > A', 'A = C', 'B < C'], e: 'Propriedade transitiva.' },
            { t: 'MMC de 2 e 3:', a: ['6', '5', '3', '2'], e: 'Primos entre si, multiplica.' }
        ]
    },

    verbs_port: ['analisou', 'publicou', 'revogou', 'assinou'],
    verb_roots: ['analisar', 'publicar', 'revogar', 'assinar'],
    crimes: ['Homicídio', 'Furto', 'Estelionato', 'Peculato'],

    // NEW: Unique Quiz Logic
    generateQuiz(topic, count = 50) {
        let questions = [];
        const templateList = this.templates[topic] || this.templates['portugues'];

        // Simple loop to generate guaranteed unique questions per session if possible
        let attempts = 0;
        const maxAttempts = count * 5;

        while (questions.length < count && attempts < maxAttempts) {
            attempts++;
            const tIdx = Math.floor(Math.random() * templateList.length);
            const template = templateList[tIdx];

            const verb = this.getRandom(this.verbs_port);
            const root = verb.slice(0, -2);
            let text = template.t.replace('_[VERB_P]_', verb).replace('_VERB_ROOT_', root).replace('_[CRIME]_', this.getRandom(this.crimes));
            let explanation = template.e.replace('_VERB_ROOT_', root);
            let options = template.a.map(opt => opt.replace('_VERB_ROOT_', root));

            // Check if exact same text exists in this current batch
            if (!questions.find(q => q.text === text)) {
                questions.push({
                    id: `${topic}_${questions.length}_${Date.now()}`,
                    category: this.formatTopicName(topic),
                    text: text,
                    options: this.shuffleOptions(options),
                    explanation: explanation
                });
            }
        }
        return questions;
    },

    formatTopicName(topic) {
        const map = {
            'portugues': 'Português', 'direito_const': 'Dir. Constitucional', 'direito_adm': 'Dir. Administrativo',
            'direito_penal': 'Dir. Penal', 'informatica': 'Informática', 'bancario': 'Conj. Bancários', 'matematica': 'RLM / Matemática'
        };
        return map[topic] || topic;
    },

    getRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; },

    shuffleOptions(answers) {
        const correct = answers[0];
        const others = answers.slice(1);
        const all = [
            { id: 'a', text: correct, correct: true },
            { id: 'b', text: others[0] || 'Opção B' },
            { id: 'c', text: others[1] || 'Opção C' },
            { id: 'd', text: others[2] || 'Opção D' }
        ];
        return all.sort(() => Math.random() - 0.5).map((opt, idx) => ({ ...opt, id: String.fromCharCode(97 + idx) }));
    }
};

// 3. Sistema de Aula Guiada Visual (ACTIVE LEARNING - REWRITTEN & EXPANDED)
const LessonSystem = {
    lessons: {
        'portugues': [
            {
                title: 'Modo Ativo: Português',
                content: 'Chega de chutes. Vamos aprender a regra para destruir a banca.',
                html: '<div class="lesson-bizu">As questões de português seguem padrões. Você vai aprendê-los agora.</div>'
            },
            {
                title: '1. Sintaxe: O Sujeito',
                content: 'A regra de ouro: O verbo SEMPRE concorda com o sujeito. Ache o sujeito primeiro!',
                html: '<div class="lesson-example">"Faltaram aos meninos coragem." (Errado)<br>"Faltou coragem aos meninos." (Correto, pois CORAGEM é o sujeito)</div>',
                interaction: {
                    question: 'Qual a forma correta?',
                    options: ['Sobrou problemas', 'Sobraram problemas'],
                    correct: 1
                }
            },
            {
                title: '2. Sujeito Indeterminado',
                content: 'Verbo na 3ª pessoa do plural sem referência anterior = Sujeito Indeterminado.',
                html: '<div class="lesson-card">"Falaram mal de você." (Quem? Não sei, não quero dizer).</div>',
                interaction: {
                    question: 'Classifique o sujeito: "Dizem que vai chover."',
                    options: ['Oculto', 'Indeterminado'],
                    correct: 1
                }
            },
            {
                title: '3. Crase: Regra Geral',
                content: 'Crase = Preposição A + Artigo A. Sem feminino, sem crase.',
                html: '<div class="lesson-bizu">Substitua por uma palavra masculina. Se der "AO", tem crase.</div>',
                interaction: {
                    question: 'Vou ___ escola. (Vou AO colégio = Tem crase)',
                    options: ['à', 'a'],
                    correct: 0
                }
            },
            {
                title: '4. Crase Proibida',
                content: 'Nunca use crase antes de verbo ou palavra masculina.',
                interaction: {
                    question: 'Está correto?',
                    options: ['Estou disposto à ajudar.', 'Estou disposto a ajudar.'],
                    correct: 1
                }
            },
            {
                title: '5. Ortografia: X ou CH?',
                content: 'Após ditongo (duas vogais juntas), usa-se X.',
                html: '<div class="lesson-example">Caixa, Peixe, Trouxa.</div>',
                interaction: {
                    question: 'Complete: "Frou__o"',
                    options: ['ch', 'x'],
                    correct: 1
                }
            },
            {
                title: '6. Regência: Assistir',
                content: 'Assistir no sentido de VER exige preposição A.',
                html: '<div class="lesson-bizu">Quem assiste, assiste A alguma coisa.</div>',
                interaction: {
                    question: 'Ele assistiu ___ filme.',
                    options: ['ao', 'o'],
                    correct: 0
                }
            },
            {
                title: '7. Conjunções: MAS vs MAIS',
                content: 'MAS = Oposição (Porém). MAIS = Quantidade.',
                interaction: {
                    question: 'Estudei, ___ não passei.',
                    options: ['mas', 'mais'],
                    correct: 0
                }
            },
            {
                title: '8. Porquês',
                content: 'Por que (Início de pergunta). Por quê (Fim de frase).',
                html: '<div class="lesson-bizu">Separado no início, acento no fim.</div>',
                interaction: {
                    question: '___ você não foi?',
                    options: ['Por que', 'Porque'],
                    correct: 0
                }
            },
            {
                title: '9. Plural dos Compostos',
                content: 'Regra geral: Substantivo varia, Adjetivo varia. Verbo NÃO varia.',
                html: '<div class="lesson-example">Guarda-chuva (Verbo+Subs) -> Guarda-chuvas.<br>Couve-flor (Subs+Subs) -> Couves-flores.</div>',
                interaction: {
                    question: 'Plural de "Beija-flor" (Verbo+Subs):',
                    options: ['Beijas-flores', 'Beija-flores'],
                    correct: 1
                }
            },
            {
                title: '10. Figuras de Linguagem',
                content: 'Metáfora é uma comparação implícita. Eufemismo suaviza.',
                html: '<div class="lesson-card">"Ele partiu dessa para melhor" = Eufemismo (Morreu).</div>',
                interaction: {
                    question: '"Sua boca é um túmulo." É uma:',
                    options: ['Metáfora', 'Metonímia'],
                    correct: 0
                }
            },

        ],

        'direito_const': [
            { title: 'Modo Ativo: Constitucional', content: 'A Lei Maior. Aprenda os fundamentos.', html: '' },
            { title: '1. Fundamentos (Art 1º)', content: 'SOCIDIVAPLU: Soberania, Cidadania, Dignidade, Valores do Trabalho, Pluralismo.', interaction: { question: 'É fundamento da República:', options: ['Intervenção', 'Pluralismo Político'], correct: 1 } },
            { title: '2. Objetivos (Art 3º)', content: 'São verbos de ação: Construir, Garantir, Erradicar, Promover.', interaction: { question: 'Qual é um Objetivo?', options: ['Cidadania', 'Erradicar a pobreza'], correct: 1 } },
            { title: '3. Relações Internacionais (Art 4º)', content: 'Independência nacional, Prevalência dos Direitos Humanos, Concessão de asilo.', interaction: { question: 'Nas relações internacionais, o Brasil busca:', options: ['Concessão de asilo político', 'Pena de morte'], correct: 0 } },
            { title: '4. Remédios: Habeas Corpus', content: 'Para proteger a liberdade de locomoção (ir e vir). Gratuito.', interaction: { question: 'Preso ilegalmente? Use:', options: ['Mandado de Segurança', 'Habeas Corpus'], correct: 1 } },
            { title: '5. Remédios: Mandado de Segurança', content: 'Direito líquido e certo, quando não couber HC ou HD.', html: '<div class="lesson-bizu">Se tem prova documental e não é liberdade física, é MS.</div>', interaction: { question: 'Juiz negou acesso a processo público. Cabe:', options: ['Habeas Data', 'Mandado de Segurança'], correct: 1 } },
            { title: '6. Inviolabilidade do Domicílio', content: 'Regra: Ninguém entra sem consentimento. Exceções: Flagrante, Desastre, Socorro (qualquer hora). Ordem Judicial (Só de dia).', interaction: { question: 'Polícia com mandado pode entrar:', options: ['A qualquer hora', 'Durante o dia'], correct: 1 } },
            { title: '7. Nacionalidade', content: 'Nato vs Naturalizado. Cargos privativos de Nato (MP3.COM): Min. STF, Presidente, Presidentes das Casas, Carreira Diplomática, Oficial das Forças Armadas, Min. Defesa.', interaction: { question: 'Cargo privativo de Brasileiro Nato:', options: ['Juiz de Direito', 'Oficial do Exército'], correct: 1 } },
            { title: '8. Extradição', content: 'Brasileiro Nato NUNCA é extraditado. Naturalizado pode (tráfico ou crime comum antes).', interaction: { question: 'Brasileiro Nato cometeu crime nos EUA e fugiu pro Brasil. Pode ser extraditado?', options: ['Sim', 'Não'], correct: 1 } },
            { title: '9. Poderes', content: 'Executivo, Legislativo e Judiciário. Independentes e Harmônicos.', interaction: { question: 'O Ministério Público é um quarto poder?', options: ['Sim', 'Não'], correct: 1 } },
            { title: '10. Direitos Sociais', content: 'Educação, Saúde, Alimentação, Trabalho, Moradia, Transporte, Lazer, Segurança, Previdência, Proteção à Maternidade e Infância, Assistência aos Desamparados.', html: '<div class="lesson-bizu">Dica: "Edu mora ali..."</div>', interaction: { question: 'É direito social:', options: ['Propriedade', 'Lazer'], correct: 1 } }
        ],

        'direito_adm': [
            { title: 'Modo Ativo: Administrativo', content: 'Como o Estado funciona.', html: '' },
            { title: '1. Princípios Expressos (LIMPE)', content: 'Legalidade, Impessoalidade, Moralidade, Publicidade, Eficiência.', interaction: { question: 'O "L" do LIMPE significa:', options: ['Liberdade', 'Legalidade'], correct: 1 } },
            { title: '2. Impessoalidade', content: 'O administrador não age em nome próprio. Proibido promoção pessoal (nomes, fotos em obras).', interaction: { question: 'Prefeito colocou nome na placa da obra. Feriu a:', options: ['Impessoalidade', 'Eficiência'], correct: 0 } },
            { title: '3. Atos Administrativos', content: 'Elementos: Competência, Finalidade, Forma, Motivo, Objeto (COFIFOMOB).', interaction: { question: 'É elemento do ato administrativo:', options: ['Competência', 'Mérito'], correct: 0 } },
            { title: '4. Atributos do Ato', content: 'PATI: Presunção de legimitidade, Autoexecutoriedade, Tipicidade, Imperatividade.', interaction: { question: 'Estado demole prédio sem ir ao juiz. Atributo:', options: ['Imperatividade', 'Autoexecutoriedade'], correct: 1 } },
            { title: '5. Abuso de Poder', content: 'Gênero que tem duas espécies: Excesso de Poder (Vício de competência) e Desvio de Finalidade.', interaction: { question: 'Remover servidor para puni-lo (sem interesse público) é:', options: ['Excesso de Poder', 'Desvio de Finalidade'], correct: 1 } },
            { title: '6. Responsabilidade Civil', content: 'Teoria do Risco Administrativo (Responsabilidade Objetiva). Não precisa provar culpa do agente.', html: '<div class="lesson-bizu">Estado paga, depois cobra do agente (regresso).</div>', interaction: { question: 'Viatura bateu no seu carro. Você precisa provar que o policial errou?', options: ['Sim', 'Não (Objetiva)'], correct: 1 } },
            { title: '7. Cargos Públicos', content: 'Regra: Concurso. Validade: Até 2 anos, prorrogável uma vez.', interaction: { question: 'O prazo de validade é de:', options: ['4 anos fixos', 'Até 2 anos'], correct: 1 } },
            { title: '8. Estabilidade', content: 'Após 3 anos de efetivo exercício + Avaliação de Desempenho.', interaction: { question: 'Prazo para estabilidade:', options: ['2 anos', '3 anos'], correct: 1 } },
            { title: '9. Acumulação de Cargos', content: 'Regra: Proibido. Exceções: 2 Prof, 1 Prof + 1 Téc/Cient, 2 Saúde.', interaction: { question: 'Médico pode ter 2 cargos públicos de médico?', options: ['Sim', 'Não'], correct: 0 } },
            { title: '10. Licitação', content: 'Obrigatória para garantir isonomia e melhor proposta. Dispensa em casos específicos (valor baixo, emergência).', interaction: { question: 'Compra de canetas (valor baixo). Licitação é:', options: ['Dispensável', 'Inexigível'], correct: 0 } }
        ],

        'informatica': [
            { title: 'Modo Ativo: Informática', content: 'Não perca ponto fácil. Atalhos e Segurança.', html: '' },
            { title: '1. Atalhos de Navegador', content: 'Ctrl+T (Nova Aba/Tab). Ctrl+N (Nova Janela). Ctrl+Shift+N (Anônima no Chrome).', interaction: { question: 'Para abrir aba anônima no Chrome:', options: ['Ctrl+Shift+N', 'Ctrl+Shift+P'], correct: 0 } },
            { title: '2. Atalhos Windows', content: 'Alt+Tab (Alternar janelas). Win+D (Mostrar Desktop). Ctrl+Shift+Esc (Gerenciador de Tarefas).', interaction: { question: 'Atalho direto para Gerenciador de Tarefas:', options: ['Ctrl+Alt+Del', 'Ctrl+Shift+Esc'], correct: 1 } },
            { title: '3. Segurança: Malware', content: 'Ransomware = Sequestro de dados (pede resgate). Phishing = Pescaria (site falso).', html: '<div class="lesson-bizu">Ransom = Resgate. Phishing = Fishing.</div>', interaction: { question: 'Vírus que criptografa arquivos e pede dinheiro:', options: ['Spyware', 'Ransomware'], correct: 1 } },
            { title: '4. Protocolos de Email', content: 'SMTP: Sua Mensagem Tá Partindo (Envio). POP3/IMAP: Recebimento.', interaction: { question: 'Protocolo para ENVIAR email:', options: ['POP3', 'SMTP'], correct: 1 } },
            { title: '5. Hardware: Memórias', content: 'RAM: Volátil (apaga ao desligar), rápida. ROM: Gravada de fábrica (BIOS). HD/SSD: Armazenamento permanente.', interaction: { question: 'Memória que perde dados sem energia:', options: ['HD', 'RAM'], correct: 1 } },
            { title: '6. Redes: IP', content: 'IPv4 (0.0.0.0 a 255.255.255.255). IPv6 (Hexadecimal, maior capacidade).', interaction: { question: 'Endereço lógico único na rede:', options: ['MAC Address', 'Endereço IP'], correct: 1 } },
            { title: '7. Backup', content: 'Cópia de segurança. Princípio 3-2-1: 3 cópias, 2 mídias diferentes, 1 em nuvem (fora).', interaction: { question: 'Backup serve para:', options: ['Liberar espaço', 'Restaurar em caso de perda'], correct: 1 } },
            { title: '8. Nuvem (Cloud)', content: 'IaaS (Infra), PaaS (Plataforma), SaaS (Software).', html: '<div class="lesson-example">Gmail e Google Drive são SaaS (Software as a Service).</div>', interaction: { question: 'Google Docs é exemplo de:', options: ['SaaS', 'IaaS'], correct: 0 } },
            { title: '9. Extensões', content: '.docx (Word), .xlsx (Excel), .pptx (PowerPoint), .pdf (Portable Document Format).', interaction: { question: 'Extensão padrão do Excel:', options: ['.xls', '.xlsx'], correct: 1 } },
            { title: '10. Firewall', content: 'Muro de fogo. Filtra o tráfego de entrada e saída. Bloqueia acessos não autorizados.', interaction: { question: 'Função do Firewall:', options: ['Remover vírus', 'Controlar tráfego de rede'], correct: 1 } }
        ],

        'bancario': [
            { title: 'Modo Ativo: Bancário', content: 'O Sistema Financeiro Nacional.', html: '' },
            { title: '1. Órgãos Normativos (Mandam)', content: 'CMN (Conselho Monetário Nacional): Manda em tudo (Moeda e Crédito). CNSP (Seguros). CNPC (Previdência).', interaction: { question: 'Órgão máximo do SFN:', options: ['Banco Central', 'CMN'], correct: 1 } },
            { title: '2. Supervisores (Fiscalizam)', content: 'Banco Central (Bacen): Bancos. CVM: Bolsa/Valores. Susep: Seguros.', interaction: { question: 'Quem fiscaliza os bancos?', options: ['CMN', 'Bacen'], correct: 1 } },
            { title: '3. Banco Central', content: 'Executor da política monetária. Emite moeda, receba compulsório, realiza redesconto.', html: '<div class="lesson-bizu">O Banco dos Bancos.</div>', interaction: { question: 'Quem emite papel-moeda?', options: ['Banco do Brasil', 'Banco Central'], correct: 1 } },
            { title: '4. Copom e Selic', content: 'Copom (Comitê de Política Monetária) define a Meta da Taxa Selic para controlar a inflação.', interaction: { question: 'A taxa básica de juros é a:', options: ['Taxa TJLP', 'Taxa Selic'], correct: 1 } },
            { title: '5. Lavagem de Dinheiro', content: 'Fases: 1. Colocação (Placement) - sujo entra. 2. Ocultação (Layering) - mistura. 3. Integração (Integration) - volta limpo.', interaction: { question: 'Fase onde o dinheiro volta com aparência lícita:', options: ['Ocultação', 'Integração'], correct: 1 } },
            { title: '6. PIX', content: 'Pagamento instantâneo brasileiro (24/7). Chaves: CPF, Email, Celular, Aleatória.', interaction: { question: 'O PIX funciona:', options: ['Apenas dias úteis', '24 horas por dia'], correct: 1 } }
        ],

        'matematica': [
            { title: 'Modo Ativo: RLM', content: 'Lógica e Matemática sem medo.', html: '' },
            { title: '1. Proposições', content: 'Frase que pode ser V ou F. Perguntas e ordens NÃO são proposições.', interaction: { question: '"Que dia lindo!" é proposição?', options: ['Sim', 'Não'], correct: 1 } },
            { title: '2. Conectivos Lógicos', content: 'E (^): Tudo V dá V. OU (v): Tudo F dá F. Se...então (->): V->F dá F (Vera Fischer é Falsa).', html: '<div class="lesson-bizu">Sebe a tabela verdade do "Se então": Só é Falso se a primeira for V e a segunda F.</div>', interaction: { question: 'Se P é V e Q é F, então P->Q é:', options: ['Verdadeiro', 'Falso'], correct: 1 } },
            { title: '3. Porcentagem', content: '10% = Divide por 10. 50% = Divide por 2. 20% = Divide por 5.', interaction: { question: '10% de 500 é:', options: ['50', '5'], correct: 0 } },
            { title: '4. Regra de Três', content: 'Direta: Multiplica cruzado. Inversa: Multiplica reto.', html: '<div class="lesson-example">Mais pedreiros, menos tempo = Inversa.</div>', interaction: { question: 'Se dobro a velocidade, o tempo:', options: ['Dobra', 'Cai pela metade'], correct: 1 } },
            { title: '5. Sequências (PA/PG)', content: 'PA: Soma constante (2, 4, 6...). PG: Multiplicação constante (2, 4, 8...).', interaction: { question: '2, 4, 8, 16... é uma:', options: ['PA', 'PG'], correct: 1 } }
        ],

        'default': [
            { title: 'Preparação Geral', content: 'Concentre-se nos fundamentos.', interaction: { question: 'Estou pronto?', options: ['Sim!'], correct: 0 } }
        ]
    },

    currentLesson: [],
    currentIndex: 0,
    currentTopic: '',
    stepLocked: false,

    startLesson(topic) {
        // --- LIVES CHECK ---
        if (UserDB.data.lives <= 0) {
            alert('🚫 GAME OVER: Sem vidas! Faça a revisão de erros para recuperar.');
            window.closeStudy();
            return;
        }

        this.currentTopic = topic;
        this.currentLesson = this.lessons[topic] || this.lessons['default'];
        this.currentIndex = 0;
        this.renderSlide();
    },

    nextSlide() {
        if (this.currentIndex < this.currentLesson.length - 1) {
            this.currentIndex++;
            this.renderSlide();
        } else {
            window.closeStudy();
            const quizzes = SyllabusDB.getQuizzes(this.currentTopic);
            if (quizzes.length > 0) goToQuiz(this.currentTopic, quizzes[0].id);
        }
    },

    prevSlide() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.renderSlide();
        }
    },

    renderSlide() {
        const slide = this.currentLesson[this.currentIndex];
        const isLast = this.currentIndex === this.currentLesson.length - 1;

        // Lock logic
        this.stepLocked = !!slide.interaction;

        const contentArea = document.getElementById('study-content-area');

        let interactionHTML = '';
        if (slide.interaction) {
            interactionHTML = `
                <div class="lesson-interaction">
                    <p style="font-weight: bold; margin-bottom: 20px; color: var(--accent-color); font-size: 1.4rem;">
                        <i class="fa-solid fa-circle-question"></i> ${slide.interaction.question}
                    </p>
                    ${slide.interaction.options.map((opt, idx) => `
                        <button class="interaction-btn" onclick="LessonSystem.checkInteraction(${idx}, this)">
                            <div class="checkbox-circle" style="width: 25px; height: 25px; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%;"></div>
                            ${opt}
                        </button>
                    `).join('')}
                    <div id="interaction-feedback" class="interaction-feedback"></div>
                </div>
            `;
        }

        contentArea.innerHTML = `
            <div class="lesson-container">
                <div class="lesson-slide">
                    <h3>${slide.title}</h3>
                    <p>${slide.content}</p>
                    ${slide.html || ''}
                    ${interactionHTML}
                </div>
                
                <div class="lesson-controls">
                    <button class="nav-btn" onclick="LessonSystem.prevSlide()" ${this.currentIndex === 0 ? 'disabled' : ''}>
                        <i class="fa-solid fa-chevron-left"></i> Voltar
                    </button>
                    
                    <div class="lesson-dots">
                        ${this.currentLesson.map((_, idx) => `<div class="dot ${idx === this.currentIndex ? 'active' : ''}" onclick="LessonSystem.jumpTo(${idx})"></div>`).join('')}
                    </div>

                    <button id="next-lesson-btn" class="nav-btn primary" onclick="LessonSystem.nextSlide()" 
                        style="${isLast && slide.interaction ? 'display: none;' : ''}" 
                        ${this.stepLocked ? 'disabled' : ''}>
                        ${isLast ? 'INICIAR QUIZ 🚀' : 'Continuar <i class="fa-solid fa-chevron-right"></i>'}
                    </button>
                </div>
            </div>
        `;
    },

    checkInteraction(selectedIdx, btnEl) {
        if (!this.stepLocked) return;

        const slide = this.currentLesson[this.currentIndex];
        const isCorrect = selectedIdx === slide.interaction.correct;
        const feedbackEl = document.getElementById('interaction-feedback');
        const nextBtn = document.getElementById('next-lesson-btn');

        // Reset buttons style
        document.querySelectorAll('.interaction-btn').forEach(b => {
            b.classList.remove('correct', 'wrong');
            b.style.pointerEvents = 'none';
        });

        if (isCorrect) {
            btnEl.classList.add('correct');
            btnEl.querySelector('.checkbox-circle').innerHTML = '<i class="fa-solid fa-check" style="color: white; font-size: 1rem;"></i>';
            btnEl.querySelector('.checkbox-circle').style.background = 'var(--success-color)';
            btnEl.querySelector('.checkbox-circle').style.borderColor = 'var(--success-color)';

            feedbackEl.style.opacity = '1';
            feedbackEl.innerHTML = '<i class="fa-solid fa-check-circle"></i> Correto! Pode avançar.';
            feedbackEl.style.color = 'var(--success-color)';

            // Unlock Next Button
            this.stepLocked = false;
            nextBtn.disabled = false;
            nextBtn.style.opacity = '1';
            nextBtn.style.cursor = 'pointer';

            // Add a little XP for learning
            UserDB.addXP(5);

            // AUTO-FORWARD IF LAST SLIDE (User Request: "Remove button")
            if (this.currentIndex === this.currentLesson.length - 1) {
                nextBtn.style.display = 'none'; // Hide button
                feedbackEl.innerHTML += ' <br>🚀 Iniciando Quiz...';
                setTimeout(() => {
                    window.closeStudy();
                    const quizzes = SyllabusDB.getQuizzes(this.currentTopic);
                    if (quizzes.length > 0) goToQuiz(this.currentTopic, quizzes[0].id);
                }, 1500);
            } else {
                // Unlock Next Button normally
                this.stepLocked = false;
                nextBtn.disabled = false;
                nextBtn.style.opacity = '1';
                nextBtn.style.cursor = 'pointer';
            }

        } else {
            // WRONG INTERACTION = LOSE LIFE
            UserDB.loseLife();

            btnEl.classList.add('wrong');
            feedbackEl.style.opacity = '1';
            feedbackEl.innerHTML = `<i class="fa-solid fa-heart-crack"></i> Ops! Perdeu 1 Vida. Restam ${UserDB.data.lives}.`;
            feedbackEl.style.color = 'var(--error-color)';

            if (UserDB.data.lives <= 0) {
                setTimeout(() => {
                    alert('💔 ACABARAM AS VIDAS!');
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                setTimeout(() => {
                    document.querySelectorAll('.interaction-btn').forEach(b => {
                        b.classList.remove('wrong');
                        b.style.pointerEvents = 'auto';
                    });
                    feedbackEl.style.opacity = '0';
                }, 1500);
            }
        }
    },

    jumpTo(index) {
        this.currentIndex = index;
        this.renderSlide();
    }
};

// 4. Estrutura do Syllabus (Unchanged)
const SyllabusDB = {
    getModules(concursoType) {
        const baseModules = [
            { id: 'portugues', title: 'Língua Portuguesa', icon: '<i class="fa-solid fa-book"></i>', quizCount: 50 },
            { id: 'informatica', title: 'Informática', icon: '<i class="fa-solid fa-laptop-code"></i>', quizCount: 30 }
        ];
        let specificModules = [];
        switch (concursoType) {
            case 'policial':
                specificModules = [
                    { id: 'direito_penal', title: 'Direito Penal', icon: '<i class="fa-solid fa-handcuffs"></i>', quizCount: 60 },
                    { id: 'direito_const', title: 'Direito Constitucional', icon: '<i class="fa-solid fa-scale-balanced"></i>', quizCount: 40 },
                    { id: 'direito_adm', title: 'Direito Administrativo', icon: '<i class="fa-solid fa-landmark"></i>', quizCount: 40 },
                    { id: 'matematica', title: 'Raciocínio Lógico', icon: '<i class="fa-solid fa-brain"></i>', quizCount: 30 }
                ];
                break;
            case 'bancario':
                specificModules = [
                    { id: 'bancario', title: 'Conhecimentos Bancários', icon: '<i class="fa-solid fa-building-columns"></i>', quizCount: 80 },
                    { id: 'matematica', title: 'Matemática Financeira', icon: '<i class="fa-solid fa-calculator"></i>', quizCount: 50 },
                    { id: 'direito_adm', title: 'Vendas e Negociação', icon: '<i class="fa-solid fa-handshake"></i>', quizCount: 40 }
                ];
                break;
            case 'tribunal':
            case 'legislativo':
                specificModules = [
                    { id: 'direito_const', title: 'Direito Constitucional', icon: '<i class="fa-solid fa-scale-balanced"></i>', quizCount: 60 },
                    { id: 'direito_adm', title: 'Direito Administrativo', icon: '<i class="fa-solid fa-landmark"></i>', quizCount: 60 },
                    { id: 'direito_penal', title: 'Legislação Específica', icon: '<i class="fa-solid fa-gavel"></i>', quizCount: 40 }
                ];
                break;
            case 'fiscal':
                specificModules = [
                    { id: 'direito_const', title: 'Direito Tributário', icon: '<i class="fa-solid fa-file-invoice-dollar"></i>', quizCount: 80 },
                    { id: 'matematica', title: 'Contabilidade', icon: '<i class="fa-solid fa-calculator"></i>', quizCount: 60 },
                    { id: 'direito_adm', title: 'Auditoria', icon: '<i class="fa-solid fa-magnifying-glass"></i>', quizCount: 40 }
                ];
                break;
            case 'admin':
            default:
                specificModules = [
                    { id: 'direito_adm', title: 'Direito Administrativo', icon: '<i class="fa-solid fa-landmark"></i>', quizCount: 50 },
                    { id: 'direito_const', title: 'Direito Constitucional', icon: '<i class="fa-solid fa-scale-balanced"></i>', quizCount: 30 },
                    { id: 'matematica', title: 'Raciocínio Lógico', icon: '<i class="fa-solid fa-brain"></i>', quizCount: 30 }
                ];
                break;
        }
        return [...baseModules, ...specificModules];
    },

    getQuizzes(moduleId) {
        let quizzes = [];
        const count = SyllabusDB.getQuizCountForModule(moduleId);
        for (let i = 1; i <= count; i++) {
            quizzes.push({
                id: `${moduleId}_q${i}`,
                title: `Bateria Intensiva #${i}`,
                desc: 'Questões selecionadas.',
                questionCount: 50
            });
        }

        // BOSS CHALLENGE
        quizzes.push({
            id: `${moduleId}_boss`,
            title: 'DESAFIO DO CHEFE',
            desc: '100% Accuracy Required',
            questionCount: 20,
            isBoss: true
        });

        return quizzes;
    },

    getQuizCountForModule(moduleId) {
        const map = {
            'portugues': 50, 'informatica': 30, 'direito_penal': 60, 'direito_const': 60,
            'direito_adm': 60, 'matematica': 50, 'bancario': 80
        };
        return map[moduleId] || 40;
    }
};

// --- DATA PERSISTENCE (UserDB) - UPDATE V4 (Com ErrorBank e Lives) ---
const UserDB = {
    key: 'bizu_user_data_v4_edu', // New version key to force fresh state for SRS
    data: {
        xp: 0,
        level: 1,
        streak: 1,
        gems: 0,
        lives: 500,
        completedQuizzes: [],
        errorBank: [], // New: Stores { questionId, text, answer, explanation, timestamp }
        migratedTo500: false
    },

    load() {
        const stored = localStorage.getItem(this.key);
        if (stored) this.data = { ...this.data, ...JSON.parse(stored) };

        // Migration: Ensure everyone gets the 500 lives upgrade
        if (!this.data.migratedTo500) {
            this.data.lives = 500;
            this.data.migratedTo500 = true;
            this.save();
        }

        this.updateLevel();
        this.checkLivesRegen(); // Auto regenerate lives if offline
        this.syncGamification(); // NEW: Sync EVERYTHING (Streak, Hearts, Gems)
        return this.data;
    },

    // --- FULL GAMIFICATION SYNC ---
    async syncGamification() {
        try {
            const userId = 1;
            const res = await fetch(`/api/gamification?userId=${userId}`);
            const data = await res.json();

            if (data.hearts !== undefined) {
                // Update Local State from Source of Truth
                this.data.lives = data.hearts;
                this.data.gems = data.gems;
                this.data.streak = data.streak;
                this.data.level = data.level;
                this.data.xp = data.xp;

                this.save();
                this.updateUI(); // Updates all headers

                // Start Timer
                if (data.next_hearts_at) {
                    this.startRegenTimer(new Date(data.next_hearts_at), new Date(data.server_now));
                }
            }
        } catch (e) {
            console.error("Failed to sync gamification:", e);
        }
    },

    // --- RECORD ACTIVITY (STREAK) ---
    async recordActivity(xpEarned) {
        try {
            const userId = 1;
            const res = await fetch('/api/gamification/activity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, xpEarned })
            });
            const data = await res.json();

            if (data.success) {
                console.log(`Activity Recorded! Streak: ${data.streak}`);
                this.syncGamification(); // Refresh UI with new streak/xp
                if (data.streak_updated) {
                    alert(`🔥 STREAK ATUALIZADO: ${data.streak} DIAS!`);
                }
            }
        } catch (e) {
            console.error("Failed to record activity:", e);
        }
    },

    // --- SPEND/EARN GEMS ---
    async transactionGems(amount, reason) {
        try {
            const userId = 1;
            const res = await fetch('/api/gamification/crystals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, amount, reason })
            });
            const data = await res.json();

            if (data.success) {
                this.data.gems = data.gems;
                this.save(); // Local optimisitc
                this.updateUI();
                return true;
            } else {
                alert(data.error || 'Erro na transação');
                return false;
            }
        } catch (e) {
            console.error("Transaction failed:", e);
            return false;
        }
    },

    startRegenTimer(targetDate, serverNow) {
        if (this.regenInterval) clearInterval(this.regenInterval);

        const serverOffset = serverNow.getTime() - Date.now(); // Calculate offset

        this.regenInterval = setInterval(() => {
            const now = Date.now() + serverOffset;
            const diff = targetDate.getTime() - now;
            const timerEl = document.getElementById('lives-timer');

            if (diff <= 0) {
                // Time's up! Revert to UI update or check status again
                clearInterval(this.regenInterval);
                if (timerEl) timerEl.innerText = '';
                this.syncHearts(); // Re-sync to verify claim
                return;
            }

            // Format HH:MM:SS
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (timerEl) {
                // Only show if lives < max (hardcoded 500 for now or fetch max)
                if (this.data.lives < 500) {
                    timerEl.innerText = `+500 em ${hours}h ${minutes}m`;
                } else {
                    timerEl.innerText = '';
                    clearInterval(this.regenInterval);
                }
            }
        }, 1000);
    },

    checkStreak() {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const lastLogin = this.data.lastLoginDate;

        if (!lastLogin) {
            // First time ever
            this.data.streak = 1;
            this.data.lastLoginDate = today;
        } else if (lastLogin !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (lastLogin === yesterdayStr) {
                // Login consecutive day -> Increase Streak
                this.data.streak++;
            } else {
                // Missed a day -> Reset to 1
                this.data.streak = 1;
            }
            this.data.lastLoginDate = today;
        }
        // If lastLogin === today, do nothing (streak already counted for today)

        this.save();
    },

    save() {
        localStorage.setItem(this.key, JSON.stringify(this.data));
        this.updateUI();
    },

    addXP(amount) {
        // Now calls backend
        this.recordActivity(amount);
    },

    addGem(amount) {
        this.transactionGems(amount, 'Reward');
    },

    // --- LIVES SYSTEM ---
    async loseLife() {
        if (this.data.lives > 0) {
            try {
                // OLD: this.data.lives--; this.save();
                const userId = 1;
                // Atomic backend update
                const res = await fetch('/api/gamification/hearts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, amount: -1, reason: 'Wrong Answer' })
                });
                const data = await res.json();

                if (data.success) {
                    this.data.lives = data.hearts;
                    this.data.lastLifeLost = Date.now(); // Optional: kept for UI effects?
                    this.save();
                    this.updateUI();

                    // Restart Timer if needed
                    if (data.next_hearts_at) {
                        this.startRegenTimer(new Date(data.next_hearts_at), new Date(data.server_now));
                    }
                }
            } catch (e) {
                console.error("Failed to lose life:", e);
                // Fallback local? No, source of truth is backend.
            }
        }
    },

    checkLivesRegen() {
        // LEGACY: Removed in favor of backend sync
        // Logic moved to /api/user/hearts-status
    },

    // --- ERROR BANK (SRS) ---
    logError(question) {
        // Prevent duplicates
        if (!this.data.errorBank.find(e => e.text === question.text)) {
            this.data.errorBank.push({
                ...question,
                missedAt: Date.now(),
                reviews: 0
            });
            this.save();
        }
    },

    clearError(questionText) {
        this.data.errorBank = this.data.errorBank.filter(e => e.text !== questionText);
        this.save();
    },

    markQuizComplete(quizId) {
        if (!this.data.completedQuizzes.includes(quizId)) {
            this.data.completedQuizzes.push(quizId);
            this.save();
        }
    },

    isQuizComplete(quizId) { return this.data.completedQuizzes.includes(quizId); },

    changeStats(xp, gems) {
        this.data.xp += xp;
        this.data.gems += gems;
        this.updateLevel();
        this.save();
    },

    updateLevel() { this.data.level = Math.floor(this.data.xp / 500) + 1; },

    updateUI() {
        const set = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };

        // Header Stats
        set('lives-counter', this.data.lives);
        set('streak-counter', this.data.streak);

        // Hero Dashboard Stats
        set('xp-display', this.data.xp);
        set('level-display', this.data.level);

        // Profile Modal Stats
        set('db-xp', this.data.xp);
        set('db-level', this.data.level);
        set('db-gems', this.data.gems);
        set('db-completed', this.data.completedQuizzes.length);

        // Lives Timer Update
        const timerEl = document.getElementById('lives-timer');
        if (timerEl) {
            if (this.data.lives < 500 && this.data.lastLifeLost) {
                const now = Date.now();
                const diffMs = now - this.data.lastLifeLost;
                const cooldownMs = 48 * 60 * 60 * 1000;
                const remainingMs = cooldownMs - diffMs;

                if (remainingMs > 0) {
                    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
                    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
                    timerEl.innerText = `+500 em ${hours}h ${minutes}m`;
                } else {
                    timerEl.innerText = 'Recarregando...';
                    this.checkLivesRegen();
                }
            } else {
                timerEl.innerText = '';
            }
        }
    }
};

// --- REVIEW SYSTEM ---
const ReviewSystem = {
    startReview() {
        if (UserDB.data.errorBank.length === 0) {
            alert('🎉 Nenhum erro pendente! Você é uma máquina!');
            return;
        }

        // Create a custom quiz config from errors
        const reviewConfig = {
            title: '🚨 Revisão de Erros',
            questions: UserDB.data.errorBank.slice(0, 10), // Review up to 10 at a time
            quizId: 'review_session',
            isReview: true // Flag to handle logic differently
        };

        localStorage.setItem('activeQuizConfig', JSON.stringify(reviewConfig));
        window.location.href = 'quiz.html';
    }
};

// --- CORE APP LOGIC ---
let activeConfig = null; // Ensure global scope
const appState = {
    view: 'home',
    activeContest: null,
    quizQuestions: [],
    currentQuestionIndex: 0
};

document.addEventListener('DOMContentLoaded', () => {
    UserDB.load();
    const path = window.location.pathname;
    if (path.includes('dashboard.html')) {
        renderHome();
        // Update timer every minute
        setInterval(() => UserDB.updateUI(), 60000);
    } else if (path.includes('quiz.html')) {
        const pendingQuiz = localStorage.getItem('activeQuizConfig');
        if (pendingQuiz) startQuizSession(JSON.parse(pendingQuiz));
        else window.location.href = 'dashboard.html';
    }
});

function renderHome() {
    // Restore Dashboard Hero if needed
    const heroContainer = document.querySelector('.dashboard-hero') || document.querySelector('.hero');
    if (heroContainer) {
        heroContainer.className = 'dashboard-hero'; // Ensure class
        heroContainer.innerHTML = `
            <div class="hero-stats-card">
                <h2>Olá, Estudante</h2>
                <p>Seu desempenho está acima da média. Continue focado.</p>
                <div style="margin-top: 20px; display: flex; gap: 20px;">
                    <div>
                        <div style="font-size: 2.5rem; font-weight: 800;" id="xp-display">0</div>
                        <div style="font-size: 0.8rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">XP Total</div>
                    </div>
                    <div style="border-left: 1px solid rgba(255,255,255,0.2); padding-left: 20px;">
                        <div style="font-size: 2.5rem; font-weight: 800;" id="level-display">1</div>
                        <div style="font-size: 0.8rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Nível</div>
                    </div>
                </div>
                <i class="fa-solid fa-chart-line hero-progress-ring"></i>
            </div>
            
            <div class="quick-actions">
                 ${(() => {
                const savedQuiz = localStorage.getItem('activeQuizConfig');
                if (savedQuiz) {
                    try {
                        const conf = JSON.parse(savedQuiz);
                        // Only show resume if not finished and has questions
                        if (conf.questions && conf.savedIndex < conf.questions.length && conf.savedIndex > 0) {
                            return `
                                    <div class="action-btn" onclick="window.location.href='quiz.html'" style="background: rgba(59, 130, 246, 0.2); border-color: var(--brand-primary);">
                                        <i class="fa-solid fa-play" style="color: var(--brand-primary);"></i>
                                        <div>
                                            <strong>Continuar: ${conf.title}</strong><br>
                                            <span style="font-size: 0.8rem; color: #94a3b8;">Questão ${conf.savedIndex + 1}</span>
                                        </div>
                                    </div>
                                 `;
                        }
                    } catch (e) { console.error(e); }
                }
                return `
                        <div class="action-btn" onclick="document.getElementById('concursos-list').scrollIntoView({behavior: 'smooth'})">
                            <i class="fa-solid fa-book-open"></i>
                            <div>
                                <strong>Continuar Estudo</strong><br>
                                <span style="font-size: 0.8rem; color: #94a3b8;">Ir para meus cursos</span>
                            </div>
                        </div>
                    `;
            })()}
                
                <div class="action-btn" onclick="openProfile()">
                    <i class="fa-solid fa-user-gear"></i>
                    <div>
                        <strong>Meu Perfil</strong><br>
                        <span style="font-size: 0.8rem; color: #94a3b8;">Ver estatísticas completas</span>
                    </div>
                </div>
            </div>
        `;
    }

    UserDB.updateUI(); // Populate new hero stats

    // Inject Review Widget (Professional Style)
    // We append this before the grid, or make it part of a "Notices" section.
    // Let's prepend to the grid container.
    const container = document.getElementById('concursos-list');
    if (!container) return;

    let reviewWidgetHTML = '';
    if (UserDB.data.errorBank.length > 0) {
        reviewWidgetHTML = `
            <div class="glass-card review-card" onclick="ReviewSystem.startReview()">
                <div class="review-content">
                    <div class="review-icon-box">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                    </div>
                    <div>
                        <h3>Revisão Necessária</h3>
                        <p>Você tem <strong class="highlight-red">${UserDB.data.errorBank.length} questões</strong> para corrigir.</p>
                    </div>
                </div>
                <button class="cta-button review-btn">
                    Revisar Agora <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        `;
    }

    // Render Pro Cards
    const listHTML = concursosData.map(c => {
        // Calculate Progress dynamically
        const allModuleIds = SyllabusDB.getModules(c.type).map(m => m.id);
        let totalQ = 0;
        let completedQ = 0;

        allModuleIds.forEach(modId => {
            const qs = SyllabusDB.getQuizzes(modId);
            totalQ += qs.length;
            completedQ += qs.filter(q => UserDB.isQuizComplete(q.id)).length;
        });

        const percent = totalQ > 0 ? Math.round((completedQ / totalQ) * 100) : 0;

        return `
        <div class="pro-card" onclick="openCourse('${c.id}')">
            <div class="pro-card-header">
                <div>
                    <h3 style="font-size: 1.2rem; font-weight: 700;">${c.title}</h3>
                    <div style="margin-top: 5px; display: flex; gap: 5px;">
                        ${c.tags.slice(0, 2).map(t => `<span class="pro-tag">${t}</span>`).join('')}
                    </div>
                </div>
                <div style="background: rgba(59, 130, 246, 0.1); width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--primary-color);">
                    <i class="fa-solid fa-book-open"></i>
                </div>
            </div>
            
            <div class="pro-card-body">
                <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.5;">${c.description}</p>
                <div style="margin-top: 15px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 5px; color: var(--text-muted);">
                        <span>Progresso Geral</span>
                        <span>${percent}%</span>
                    </div>
                    <div style="height: 6px; background: rgba(148, 163, 184, 0.2); border-radius: 3px; overflow: hidden;">
                        <div style="width: ${percent}%; background: ${percent === 100 ? 'var(--success-color)' : 'var(--primary-color)'}; height: 100%;"></div>
                    </div>
                </div>
            </div>

            <div class="pro-card-footer">
                <span><i class="fa-solid fa-layer-group"></i> ${c.totalModules} Módulos</span>
                <span><i class="fa-solid fa-clipboard-question"></i> ${c.totalQuizzes} Questões</span>
            </div>
        </div>
    `}).join('');

    container.innerHTML = `
        ${reviewWidgetHTML}
        ${listHTML}
    `;
}

function openCourse(contestId) {
    const contest = concursosData.find(c => c.id === contestId);
    if (!contest) return;
    appState.activeContest = contest;

    // Replace Dashboard Hero with Course Header
    const heroContainer = document.querySelector('.dashboard-hero') || document.querySelector('.hero');
    if (heroContainer) {
        // Temporarily change class for styling if needed, or just reuse
        heroContainer.innerHTML = `
            <div style="grid-column: 1 / -1; background: var(--card-bg); padding: 30px; border-radius: var(--card-radius); border: 1px solid var(--glass-border); display: flex; flex-direction: column; gap: 15px;">
                <button onclick="renderHome()" style="background: none; border: none; color: var(--text-muted); cursor: pointer; align-self: flex-start; display: flex; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-arrow-left"></i> Voltar ao Dashboard
                </button>
                <div>
                    <h2 style="font-size: 2rem; color: var(--text-color);">${contest.title}</h2>
                    <p style="color: var(--primary-color); font-weight: 600;">${contest.type.toUpperCase()} • Cronograma de Elite</p>
                </div>
            </div>
        `;
    }

    const container = document.getElementById('concursos-list');
    const modules = SyllabusDB.getModules(contest.type);

    container.innerHTML = `
        <div style="grid-column: 1 / -1;">
            ${modules.map(mod => {
        const allQuizzes = SyllabusDB.getQuizzes(mod.id);
        const total = allQuizzes.length;
        const completed = allQuizzes.filter(q => UserDB.isQuizComplete(q.id)).length;
        const percent = Math.round((completed / total) * 100);

        return `
                <div class="glass-card" style="margin-bottom: 20px; cursor: pointer;" onclick="toggleModule('${mod.id}')">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <span style="font-size: 2rem; color: var(--secondary-color);">${mod.icon}</span>
                            <div>
                                <h3 style="font-size: 1.2rem;">${mod.title}</h3>
                                <p style="font-size: 0.9rem; color: #94a3b8;">${mod.quizCount} Baterias Disponíveis</p>
                            </div>
                        </div>
                        <span id="arrow-${mod.id}" style="font-size: 1.2rem; transition: transform 0.3s;"><i class="fa-solid fa-chevron-down"></i></span>
                    </div>
                    
                    <div style="margin-top: 15px; display: flex; align-items: center; gap: 10px;">
                        <div class="progress-container" style="flex: 1; height: 8px; background: rgba(255,255,255,0.1);">
                            <div class="progress-bar" style="width: ${percent}%; background: ${percent === 100 ? 'var(--success-color)' : 'var(--primary-color)'};"></div>
                        </div>
                        <span style="font-size: 0.8rem; font-weight: bold; color: ${percent === 100 ? 'var(--success-color)' : '#94a3b8'}">${completed}/${total} (${percent}%)</span>
                    </div>

                    <div id="list-${mod.id}" style="display: none; margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                        <!-- Quizzes -->
                    </div>
                </div>
            `}).join('')}
        </div>
    `;
}

function toggleModule(modId) {
    const listEl = document.getElementById(`list-${modId}`);
    const arrow = document.getElementById(`arrow-${modId}`);

    if (listEl.style.display === 'none') {
        listEl.style.display = 'block';
        arrow.style.transform = 'rotate(180deg)';
        const quizzes = SyllabusDB.getQuizzes(modId);

        listEl.innerHTML = `
            <div style="margin-bottom: 20px;">
                <button onclick="event.stopPropagation(); openStudy('${modId}')" class="cta-button" style="width: 100%; padding: 15px; display: flex; justify-content: center; align-items: center; gap: 10px; background: linear-gradient(135deg, #3b82f6, #2563eb);">
                    <i class="fa-solid fa-graduation-cap"></i> Aula Guiada + Quiz
                </button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;">
                ${quizzes.map(q => {
            const isDone = UserDB.isQuizComplete(q.id);
            const isBoss = q.id.includes('_boss');
            const bossStyle = isBoss ? 'border: 2px solid #ef4444; background: linear-gradient(45deg, #450a0a, transparent);' : '';
            const bossIcon = isBoss ? '<i class="fa-solid fa-skull boss-skull-icon" style="font-size:1.2rem;"></i>' : '';

            return `
                    <div onclick="event.stopPropagation(); goToQuiz('${modId}', '${q.id}')" style="${bossStyle} background: ${isDone ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255,255,255,0.05)'}; padding: 15px; border-radius: 8px; cursor: pointer; transition: all 0.2s; border: ${isBoss ? '2px solid #ef4444' : (isDone ? '1px solid var(--success-color)' : '1px solid transparent')}; text-align: left;">
                        <div style="display:flex; justify-content:space-between;">
                            <h4 style="color: ${isBoss ? '#ef4444' : 'var(--text-color)'}; margin-bottom: 5px; font-weight: bold;">
                                ${bossIcon} ${q.title}
                            </h4>
                            ${isDone ? '<i class="fa-solid fa-check" style="color: var(--success-color)"></i>' : ''}
                        </div>
                        <p style="font-size: 0.8rem; color: #94a3b8;">${q.questionCount} Questões ${isBoss ? '| ⚠️ Alta Dificuldade' : ''}</p>
                    </div>
                    `;
        }).join('')}
            </div>
        `;
    } else {
        listEl.style.display = 'none';
        arrow.style.transform = 'rotate(0deg)';
    }
}

function goToQuiz(modId, quizId) {
    // LIVES CHECK FOR QUIZ START
    if (UserDB.data.lives <= 0) {
        alert('💔 ACABARAM AS VIDAS! Você precisa revisar ou esperar para continuar.');
        return;
    }

    const isBoss = quizId.includes('_boss');
    if (isBoss) {
        alert('💀 MODO MORTAL ATIVADO 💀\n\n- São 20 questões.\n- ERROU = MORREU (Perde todas as vidas).\n- Precisa de 100% de acerto.\n\nBoa sorte, você vai precisar.');
    }

    const config = {
        title: isBoss ? '💀 DESAFIO DO CHEFE 💀' : 'Modo Gigante Bizu',
        questions: QuestionGenerator.generateQuiz(modId, isBoss ? 20 : 50),
        quizId: quizId,
        isReview: false,
        isBoss: isBoss
    };
    localStorage.setItem('activeQuizConfig', JSON.stringify(config));
    window.location.href = 'quiz.html';
}

function startQuizSession(config) {
    if (!config || !config.questions) return;
    activeConfig = config;
    appState.quizQuestions = config.questions;
    // RESUME LOGIC: Check if there is a saved index
    appState.currentQuestionIndex = config.savedIndex || 0;
    renderQuizQuestion();
    document.getElementById('check-btn').onclick = checkAnswer;
    document.getElementById('next-btn').onclick = nextQuestion;

    // Apply Boss Mode Theme
    const container = document.querySelector('.container');
    if (config.isBoss) {
        container.classList.add('boss-mode-theme');
        document.getElementById('question-category').innerHTML = `<i class="fa-solid fa-skull"></i> MODO MORTAL`;
    } else {
        container.classList.remove('boss-mode-theme');
    }

    // Modify UI for Review Mode
    if (config.isReview) {
        document.querySelector('.question-header').innerHTML += '<div style="margin-top:10px;"><span style="background:rgba(239,68,68,0.2); color:#fca5a5; padding:4px 12px; border-radius:4px; font-size:0.8rem; font-weight:600;">Modo Revisão</span></div>';
    }
}

function renderQuizQuestion() {
    const q = appState.quizQuestions[appState.currentQuestionIndex];
    document.getElementById('question-text').innerText = q.text;
    document.getElementById('question-category').innerHTML = `<i class="fa-solid fa-layer-group"></i> ${q.category || 'Geral'}`;
    document.getElementById('question-counter').innerText = `${appState.currentQuestionIndex + 1}/${appState.quizQuestions.length}`;

    document.getElementById('options-grid').innerHTML = q.options.map(opt => `
        <div class="option-card" data-id="${opt.id}" onclick="selectOption('${opt.id}')">
            <div class="option-radio"></div>
            <span class="option-content">${opt.text}</span>
            <i class="fa-solid fa-check" style="display:none; color: var(--color-success);"></i> <!-- Placeholder for icon -->
        </div>
    `).join('');

    document.getElementById('quiz-progress').style.width = `${((appState.currentQuestionIndex + 1) / appState.quizQuestions.length) * 100}%`;
    document.getElementById('check-btn').style.display = 'flex'; // Use flex for icon alignment
    document.getElementById('check-btn').disabled = true;
    document.getElementById('next-btn').style.display = 'none';
    document.getElementById('feedback-area').style.display = 'none';
}

let selectedId = null;
window.selectOption = (id) => {
    document.querySelectorAll('.option-card').forEach(b => b.classList.remove('selected'));
    const selectedEl = document.querySelector(`.option-card[data-id="${id}"]`);
    if (selectedEl) selectedEl.classList.add('selected');
    selectedId = id;
    document.getElementById('check-btn').disabled = false;
};

function checkAnswer() {
    const q = appState.quizQuestions[appState.currentQuestionIndex];
    const isCorrect = q.options.find(o => o.id === selectedId).correct;
    document.querySelectorAll('.option-card').forEach(b => {
        b.style.pointerEvents = 'none';

        // Always mark the correct one
        if (q.options.find(o => o.id === b.dataset.id).correct) {
            b.classList.add('correct');
        }

        // Mark chosen if wrong
        if (b.dataset.id === selectedId && !isCorrect) {
            b.classList.add('wrong');
        }
    });

    document.getElementById('check-btn').style.display = 'none';
    document.getElementById('next-btn').style.display = 'flex'; // Flex for icon

    // LOGIC UPDATE: Handle Lives & ErrorBank
    if (!isCorrect) {
        if (!activeConfig.isReview) {
            if (activeConfig.isBoss) {
                UserDB.data.lives = 0; // INSTANT DEATH
                UserDB.save();
                alert('💀 O CHEFE TE DESTRUIU! (-5 VIDAS)');
            } else {
                UserDB.loseLife();
            }
            UserDB.logError(q);
        }
    } else {
        if (activeConfig.isReview) {
            UserDB.clearError(q.text);
        }
    }

    feed.style.display = 'block';
    // Use new cleaner classes instead of inline styles
    feed.innerHTML = `
        <div class="feedback-box ${isCorrect ? 'success' : 'error'}">
            <div class="feedback-icon">
                <i class="fa-solid ${isCorrect ? 'fa-circle-check' : 'fa-circle-xmark'}" style="color: ${isCorrect ? 'var(--color-success)' : 'var(--color-error)'}"></i>
            </div>
            <div class="feedback-content">
                <span class="feedback-title" style="color: ${isCorrect ? 'var(--color-success)' : 'var(--color-error)'}">
                    ${isCorrect ? 'Resposta Correta' : 'Resposta Incorreta'}
                </span>
                <div class="feedback-bizu">
                    <strong>Bizu:</strong> ${q.explanation || 'Sem comentários adicionais.'} <br>
                    ${!isCorrect && !activeConfig.isReview ? `<span class="feedback-life-loss"><i class="fa-solid fa-heart-crack"></i> -1 Vida (${UserDB.data.lives} restantes)</span>` : ''}
                </div>
            </div>
        </div>
    `;

    if (isCorrect) UserDB.addXP(activeConfig.isBoss ? 50 : 10);

    // Check game over condition immediately
    if (UserDB.data.lives <= 0 && !isCorrect && !activeConfig.isReview) {
        setTimeout(() => {
            alert('😭 Suas vidas acabaram! Você precisa revisar seus erros.');
            window.location.href = 'dashboard.html';
        }, 2000);
    }
}

function nextQuestion() {
    appState.currentQuestionIndex++;

    // SAVE PROGRESS: Update local storage with new index
    if (activeConfig) {
        activeConfig.savedIndex = appState.currentQuestionIndex;
        localStorage.setItem('activeQuizConfig', JSON.stringify(activeConfig));
    }

    if (appState.currentQuestionIndex < appState.quizQuestions.length) renderQuizQuestion();
    else finishQuiz();
}

function finishQuiz() {
    if (activeConfig && activeConfig.quizId && !activeConfig.isReview) {
        UserDB.markQuizComplete(activeConfig.quizId);
    }

    let message = 'Módulo Concluído!';
    let subMessage = '+500 XP Salvos';

    if (activeConfig.isReview) {
        message = 'Revisão Concluída!';
        subMessage = 'Erros limpos com sucesso!';
        UserDB.addXP(100);
    } else {
        UserDB.changeStats(500, 100);
    }

    document.querySelector('.quiz-container').innerHTML = `
        <div class="glass-card" style="text-align: center; padding: 40px;">
            <div style="font-size: 4rem; margin-bottom: 20px; color: var(--primary-color);">
                <i class="fa-solid fa-trophy"></i>
            </div>
            <h2>${message}</h2>
            <p>Seu progresso foi salvo no Banco de Dados.</p>
            <p style="color: var(--accent-color);">${subMessage}</p>
            <br>
            <button class="cta-button" onclick="window.location.href='dashboard.html'"><i class="fa-solid fa-arrow-left"></i> Menu Principal</button>
        </div>
    `;
}

// --- PROFILE / DB MODAL LOGIC ---
window.openProfile = function () {
    const modal = document.getElementById('profile-modal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('modal-open'), 10);
    document.getElementById('db-level').innerText = UserDB.data.level;
    document.getElementById('db-xp').innerText = UserDB.data.xp;
    document.getElementById('db-gems').innerText = UserDB.data.gems;
    document.getElementById('db-completed').innerText = UserDB.data.completedQuizzes.length;

    const currentLevelXP = (UserDB.data.level - 1) * 500;
    const progress = ((UserDB.data.xp - currentLevelXP) / 500) * 100;
    const finalPercent = Math.min(100, Math.max(0, Math.floor(progress)));

    const xpInLevel = UserDB.data.xp - currentLevelXP;
    document.getElementById('next-level-num').innerText = UserDB.data.level + 1;
    document.getElementById('db-progress-percent').innerText = `${finalPercent}% (${xpInLevel}/500 XP)`; // Detail for user

    // Update Bar (Just width, no text inside)
    const bar = document.getElementById('db-progress-bar');
    bar.style.width = `${finalPercent}%`;
    bar.innerText = ''; // Clear text inside bar
};

window.closeProfile = function () {
    const modal = document.getElementById('profile-modal');
    modal.classList.remove('modal-open');
    setTimeout(() => modal.style.display = 'none', 300);
};

// --- STUDY THEORY LOGIC (AGORA SISTEMA DE AULA - ACTIVE LEARNING ENABLED) ---
window.openStudy = function (topic) {
    const modal = document.getElementById('study-modal');
    const title = document.getElementById('study-title');

    title.innerHTML = '<i class="fa-solid fa-graduation-cap"></i> Aula Guiada';

    // Iniciar Aula
    LessonSystem.startLesson(topic);

    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('modal-open'), 10);
};

window.closeStudy = function () {
    const modal = document.getElementById('study-modal');
    modal.classList.remove('modal-open');
    setTimeout(() => modal.style.display = 'none', 300);
};

// --- STORE LOGIC ---
window.openStore = function () {
    // Close other modals to prevent overlap
    if (window.closeProfile) window.closeProfile();
    if (window.closeStudy) window.closeStudy();

    const modal = document.getElementById('store-modal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('modal-open'), 10);
    document.getElementById('store-gems-display').innerText = UserDB.data.gems;
};

window.closeStore = function () {
    const modal = document.getElementById('store-modal');
    modal.classList.remove('modal-open');
    setTimeout(() => modal.style.display = 'none', 300);
};

// Inject buy logic into UserDB
UserDB.buyItem = function (itemId) {
    if (itemId === 'lives_refill') {
        const cost = 500;
        if (this.data.gems >= cost) {

            if (this.data.lives >= 500) {
                alert('⚠️ Suas vidas já estão cheias!');
                return;
            }
            if (confirm(`Gastar ${cost} Cristais para recuperar todas as vidas?`)) {

                // We need to deduct gems AND refill lives.
                // Ideally this is one atomic backend operation "/store/buy-refill".
                // But using our primitives:

                this.transactionGems(-cost, 'Lives Refill').then(async (success) => {
                    if (success) {
                        // Now refill hearts. We don't have a "set max" endpoint, but we can do a big add?
                        // Or create a logical "Refill" action.
                        // For now, let's just add 500 (capped by max logic if we had it, or use the claim logic).
                        // Actually, I'll assume `hearts.js` logic handles simple math.
                        // A better way is creating a `POST /api/store/buy` but I'm limited to "Gamification" scope.

                        // Let's rely on a manual refill call:
                        const userId = 1;
                        const res = await fetch('/api/gamification/hearts', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId, amount: 500, reason: 'Refill Purchase' })
                        });
                        const data = await res.json();

                        if (data.success) {
                            this.syncGamification(); // Sync everything
                            window.closeStore();
                            alert('❤️ Vidas recarregadas com sucesso!');
                        }
                    }
                });
            }
        } else {
            alert(`💎 Cristais insuficientes! Você precisa de ${cost}.`);
        }
    }
};
