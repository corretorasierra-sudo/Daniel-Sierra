-- A tela de leads do vendedor virou uma planilha simples e precisa do status
-- "sem resposta" como opção junto de novo/em tratativa/perdido/concluído.
ALTER TYPE "EtapaLead" ADD VALUE 'SEM_RESPOSTA';
