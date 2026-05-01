-- Função genérica para atualizar a data de atualização de um registro
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURN TRIGGER AS $$
BEGIN
  NEW.updated_at = now(); -- Define a data de atualização como a data e hora atual
  RETURN NEW; -- Retorna o registro atualizado
END;
$$ LANGUAGE plpgsql;
