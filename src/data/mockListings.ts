import type { Listing } from "../types";

export const mockListings: Listing[] = [
  {
    id: "1",
    title: "Sofá 3 lugares — cinza, impecável",
    description:
      "Sofá estofado na cor cinza chumbo, 3 lugares. Usado por apenas 1 ano, sem manchas ou rasgos. Estrutura em madeira maciça, espuma D33. Medidas: 2,10m × 0,90m. Necessário retirar no apartamento.",
    category: "venda",
    price: 850,
    whatsapp: "11999000001",
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80"
    ],
    authorName: "Maria Oliveira",
    createdAt: "2026-04-28T10:00:00Z"
  },
  {
    id: "2",
    title: "Bicicleta aro 29 — mountain bike",
    description:
      "Bicicleta aro 29, 21 marchas Shimano, freios a disco mecânico. Pouco usada, em excelente estado. Acompanha capacete (M) e bomba de ar. Ideal para trilhas e uso urbano.",
    category: "venda",
    price: 650,
    whatsapp: "11999000002",
    images: [
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80"
    ],
    authorName: "Carlos Mendes",
    createdAt: "2026-04-25T14:30:00Z"
  },
  {
    id: "3",
    title: 'Smart TV 43" Samsung — 4K',
    description:
      "Smart TV Samsung 43 polegadas 4K, com Wi-Fi e Bluetooth integrados. Controle remoto original. Funcionando perfeitamente, substituída por modelo maior. Retirar no apartamento.",
    category: "venda",
    price: 1200,
    whatsapp: "11999000009",
    images: [
      "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=1200&q=80"
    ],
    authorName: "Lucas Ferreira",
    createdAt: "2026-05-01T09:00:00Z"
  },
  {
    id: "4",
    title: "Eletricista residencial — CREA ativo",
    description:
      "Serviços elétricos residenciais: instalação de tomadas, disjuntores, lustres e quadro de luz. 15 anos de experiência. CREA ativo. Atendo a comunidade do condomínio com prioridade. Orçamento sem compromisso.",
    category: "servicos",
    price: 150,
    whatsapp: "11999000003",
    images: [
      "https://images.unsplash.com/photo-1555963966-b7ae5404b6ed?auto=format&fit=crop&w=1200&q=80"
    ],
    authorName: "Roberto Santos",
    createdAt: "2026-04-20T09:00:00Z"
  },
  {
    id: "5",
    title: "Aulas particulares de inglês",
    description:
      "Professora formada em Letras com 10 anos de experiência. Aulas online e presenciais para todos os níveis: básico, intermediário e avançado. Preparação para IELTS e TOEFL. Metodologia personalizada.",
    category: "servicos",
    price: 80,
    whatsapp: "11999000004",
    images: [
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80"
    ],
    authorName: "Ana Paula Lima",
    createdAt: "2026-04-22T16:00:00Z"
  },
  {
    id: "6",
    title: "Restaurante japonês — rodízio imperdível",
    description:
      "Recomendo o Kyoto Garden na Rua das Flores, 45. Sushi fresquíssimo, rodízio às sextas e sábados por R$89,90. Ambiente familiar, perfeito para levar crianças. Mencione o condomínio e ganhe 10% de desconto.",
    category: "indicacoes",
    whatsapp: "11999000005",
    images: [
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=80"
    ],
    authorName: "Juliana Costa",
    createdAt: "2026-04-15T12:00:00Z"
  },
  {
    id: "7",
    title: "Pet shop — preços justos e ótimo atendimento",
    description:
      "O Pet Happy na Av. Principal tem ótimos preços e atendimento veterinário de qualidade. Banho e tosa, vacinas, consultas e acessórios. Trabalham com todos os portes. Abertos aos sábados até 18h.",
    category: "indicacoes",
    whatsapp: "11999000006",
    images: [
      "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1200&q=80"
    ],
    authorName: "Fernando Rocha",
    createdAt: "2026-04-18T11:00:00Z"
  },
  {
    id: "8",
    title: "Mesa de escritório com gavetas — branca",
    description:
      "Mesa de escritório em MDF branco, 120cm × 60cm, com 3 gavetas e suporte para CPU embutido. Em bom estado, com pequenos riscos na lateral direita. Necessário retirar no apartamento, não fazemos entrega.",
    category: "doacao",
    whatsapp: "11999000007",
    images: [
      "https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=1200&q=80"
    ],
    authorName: "Beatriz Alves",
    createdAt: "2026-04-10T08:00:00Z"
  },
  {
    id: "9",
    title: "Kit de halteres — 5kg, 8kg e 10kg",
    description:
      "Kit com 3 pares de halteres de borracha emborrachada: 5kg, 8kg e 10kg. Inclui suporte de chão em aço. Perfeito para montar academia em casa. Acompanha colchonete de yoga 10mm. Apenas retirada.",
    category: "doacao",
    whatsapp: "11999000008",
    images: [
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80"
    ],
    authorName: "Diego Martins",
    createdAt: "2026-04-12T15:00:00Z"
  },
  {
    id: "10",
    title: "Vaga de garagem — aluguel mensal",
    description:
      "Vaga coberta no subsolo, próxima ao elevador. Ideal para carros de médio porte. Disponível a partir do próximo mês. Contrato de 6 ou 12 meses. Valor inclui IPTU proporcional.",
    category: "imoveis",
    price: 350,
    whatsapp: "11999000010",
    images: [
      "https://images.unsplash.com/photo-1621929747188-0b4dc28498d2?auto=format&fit=crop&w=1200&q=80"
    ],
    authorName: "Renata Souza",
    createdAt: "2026-05-01T11:00:00Z"
  },
  {
    id: "11",
    title: "Diarista recomendada — confiança e referências",
    description:
      "A diarista Neide atende vários moradores do condomínio há mais de 4 anos, sempre com ótima avaliação. Faz limpeza completa, organização e passadoria leve. Disponibilidade de segunda a sábado, com referências de famílias do bloco A e B.",
    category: "indicacoes",
    whatsapp: "11999000011",
    images: [
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80"
    ],
    authorName: "Patricia Lima",
    createdAt: "2026-05-03T09:30:00Z"
  }
];
