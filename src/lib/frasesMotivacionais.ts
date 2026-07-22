/**
 * Pack de frases motivacionais pra home do vendedor — uma por dia, a mesma
 * pro time inteiro naquele dia (não muda a cada F5). Escolha determinística
 * por data em `frasesDoDia`, sem repetir o índice do dia anterior.
 */

export const FRASES_MOTIVACIONAIS: string[] = [
  "Todo não de hoje é um sim que ainda não achou o dia certo. Liga de novo amanhã.",
  "Lead frio não é um problema seu — é o ponto de partida do seu trabalho.",
  "Quem liga primeiro no dia costuma fechar primeiro no mês.",
  "20 contatos, 2 vendas. A conta já fechou antes de você discar — sua parte é discar.",
  "Ninguém bate meta pensando na meta. Bate fazendo a próxima ligação.",
  "O cliente que não atendeu hoje pode atender amanhã. Só se você tentar de novo.",
  "Desistir de um lead frio cedo demais é o jeito mais silencioso de perder venda.",
  "Sua meta não é sorte, é rotina — quem faz o número de contatos, bate.",
  "Cada follow-up é uma chance nova, não uma insistência chata.",
  "O dia começa contando: quantos leads eu ainda não toquei hoje?",
  "Rejeição não é sobre você. É sobre o momento da pessoa. Segue o jogo.",
  "Constância vende mais que talento. Mostra a cara todo santo dia.",
  "Quem trabalha volume trabalha tranquilo — a meta vem sozinha no fim do mês.",
  "Se hoje foi difícil, amanhã tem 20 leads novos esperando um contato seu.",
  "A venda de hoje começou com um contato de alguns dias atrás. Planta hoje pra colher depois.",
  "Ninguém lembra quantos 'não' você ouviu. Todo mundo lembra o mês que você fechou.",
  "Seu concorrente de hoje é o vendedor de ontem que quase desistiu. Não seja ele.",
  "Bater meta é resultado. Fazer contato é o que está no seu controle agora.",
  "O primeiro 'não' da manhã não define o resto do seu dia.",
  "Vendedor bom não tem sorte, tem lista trabalhada até o fim.",
  "Ligou, não atendeu? Marca retorno e segue pro próximo. Não trava no primeiro.",
  "Toda meta grande é só uma sequência de dias comuns bem trabalhados.",
  "O lead que você não ligar hoje, seu concorrente pode ligar amanhã.",
  "Confiança se constrói ligação por ligação, não esperando o momento perfeito.",
  "Seu resultado de sexta já começou na segunda-feira.",
  "Cliente cansado de plano caro só precisa ouvir de alguém que se importa. Seja você.",
  "Quem cuida do funil todo dia não precisa correr atrás no fim do mês.",
  "A energia da primeira ligação do dia contamina todas as outras. Começa forte.",
  "Não é sobre convencer, é sobre mostrar pra quem já precisa do que você tem.",
  "Foco no que dá pra fazer agora: o próximo contato da sua lista.",
  "Toda família que fecha com a gente é uma família com menos medo de ficar doente.",
  "Seu trabalho hoje é resolver o problema de saúde de alguém que ainda nem te conhece.",
  "Não existe mês bom sem semana boa, e não existe semana boa sem dia bem trabalhado.",
  "O 'não' de agora é só o 'ainda não' de um lead frio. Marca e volta depois.",
  "Vendedor que aquece lead frio de verdade não usa script, usa atenção.",
  "Hoje é mais uma chance de virar o mês — usa ela inteira.",
  "A meta não cobra de você, ela só mostra se sua rotina tá no ritmo certo.",
  "Consistência é fazer o de sempre nos dias em que você não tá com vontade.",
  "Cada contato de qualidade hoje é uma venda com menos trabalho amanhã.",
  "Quem faz o número certo de ligações não precisa se preocupar com o número da meta.",
  "O melhor vendedor do time não é o mais talentoso, é o que não some do funil.",
  "Se o lead esfriou, o problema não é o lead — é o tempo sem contato. Corrige isso hoje.",
  "Vendas boas começam com follow-up feito na hora certa, não no dia que sobrar tempo.",
  "Você não está vendendo mensalidade, está vendendo tranquilidade pra uma família.",
  "O trabalho de hoje é invisível até o resultado aparecer no fim do mês. Confia no processo.",
  "Cada 'me liga depois' é uma oportunidade agendada, não um não disfarçado.",
  "Grandes vendedores têm um segredo simples: eles simplesmente não param de ligar.",
  "Sua régua de hoje não é o resultado, é o esforço que você consegue controlar.",
  "Comece pelo lead mais difícil da lista — o resto do dia fica mais leve.",
  "Fechar a meta é consequência. Trabalhar o funil todo dia é a causa.",
];

/** Índice de hoje dentro do pack (0-based), estável o dia inteiro pro time inteiro. */
export function indiceFraseDoDia(hoje: Date = new Date(), total = FRASES_MOTIVACIONAIS.length): number {
  const chave = `${hoje.getFullYear()}${hoje.getMonth()}${hoje.getDate()}`;
  let hash = 0;
  for (let i = 0; i < chave.length; i++) {
    hash = (hash * 31 + chave.charCodeAt(i)) % 1_000_000_007;
  }
  return hash % total;
}

/** Frase do dia — mesma pra todo mundo que abrir o CRM na mesma data. */
export function fraseDoDia(hoje: Date = new Date()): string {
  return FRASES_MOTIVACIONAIS[indiceFraseDoDia(hoje)];
}
