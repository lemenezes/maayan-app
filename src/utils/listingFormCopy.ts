import type { Category } from "../types";

interface ListingFormCopy {
  titlePlaceholder: string;
  descriptionPlaceholder: string;
  valueHelpText: string;
  categoryHelpText: string;
  priceModeLabel?: string;
  priceModeHelpText?: string;
}

const CATEGORY_OPTION_DESCRIPTION: Record<Category, string> = {
  imoveis: "Venda ou locação de imóveis",
  servicos: "Serviços oferecidos por moradores",
  indicacoes: "Recomendações de profissionais ou serviços",
  doacao: "Itens disponibilizados gratuitamente",
  venda: "Produtos e objetos à venda"
};

export function getCategoryOptionDescription(category: Category): string {
  return CATEGORY_OPTION_DESCRIPTION[category];
}

export function getListingFormCopy(category: Category): ListingFormCopy {
  switch (category) {
    case "venda":
      return {
        titlePlaceholder: "Ex: Sofá 3 lugares em ótimo estado",
        descriptionPlaceholder:
          "Informe estado de conservação, medidas, tempo de uso, detalhes e forma de retirada.",
        valueHelpText: "Informe o valor de venda do item.",
        categoryHelpText:
          "Anuncie produtos ou itens que deseja vender para outros moradores."
      };

    case "doacao":
      return {
        titlePlaceholder: "Ex: Berço desmontável para doação",
        descriptionPlaceholder:
          "Descreva o item, estado de conservação e como combinar a retirada.",
        valueHelpText: "Este anúncio será exibido como gratuito.",
        categoryHelpText:
          "Disponibilize itens gratuitamente para a comunidade."
      };

    case "servicos":
      return {
        titlePlaceholder: "Ex: Aulas particulares de matemática",
        descriptionPlaceholder:
          "Explique o serviço oferecido, disponibilidade, experiência e forma de atendimento.",
        valueHelpText: "Defina como deseja cobrar pelo serviço.",
        categoryHelpText:
          "Divulgue serviços prestados por você, informando valores e forma de atendimento.",
        priceModeLabel: "Tipo de cobrança",
        priceModeHelpText:
          "Escolha como deseja cobrar: por hora, diária, por serviço ou a combinar."
      };

    case "indicacoes":
      return {
        titlePlaceholder: "Ex: Diarista de confiança",
        descriptionPlaceholder:
          "Explique por que você recomenda essa pessoa ou serviço.",
        valueHelpText: "Valor opcional para referência.",
        categoryHelpText:
          "Recomende profissionais ou serviços que você já utilizou e confia. Os interessados entrarão em contato diretamente com a pessoa indicada."
      };

    case "imoveis":
      return {
        titlePlaceholder: "Ex: Apartamento para locação no Maayan",
        descriptionPlaceholder:
          "Informe metragem, quartos, vagas, andar, diferenciais e condições de visita.",
        valueHelpText: "Informe o valor de venda ou locação do imóvel.",
        categoryHelpText:
          "Anuncie imóveis para venda ou locação, informando detalhes e condições.",
        priceModeLabel: "Tipo",
        priceModeHelpText: "Selecione se é venda ou locação."
      };

    default:
      return {
        titlePlaceholder: "Ex: Anuncio",
        descriptionPlaceholder: "Descreva o que está anunciando com detalhes...",
        valueHelpText: "Informe o valor do anúncio.",
        categoryHelpText: "Selecione a categoria que melhor descreve seu anúncio."
      };
  }
}
