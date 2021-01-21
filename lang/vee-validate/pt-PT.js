const custom = {
    path: {
      regex: 'Por favor, insira apenas o caminho da sua página ou script.',
    },
};

const messages = {
  after: (field, [target]) => `O campo ${field} deve estar depois do campo ${target}.`,
  alpha: field => `O campo ${field} deve conter somente letras.`,
  alpha_dash: field => `O campo ${field} deve conter somente letras, números e traços.`,
  alpha_num: field => `O campo ${field} deve conter somente letras e números.`,
  alpha_spaces: field => `O campo ${field}  deve conter somente caracteres alfabéticos e espaços.`,
  before: (field, [target]) => `O campo ${field} deve estar antes do campo ${target}.`,
  between: (field, [min, max]) => `O campo ${field} deve estar entre ${min} e ${max}.`,
  confirmed: (field, [confirmedField]) => `Os campos ${field} e ${confirmedField} devem ser iguais.`,
  credit_card: field => `O campo ${field} é inválido.`,
  date_between: (field, [min, max]) => `O campo ${field} deve estar entre ${min} e ${max}.`,
  date_format: (field, [format]) => `O campo ${field} deve estar no formato ${format}.`,
  decimal: (field, [decimals = "*"] = []) => `O campo ${field} deve ser numérico e deve conter ${!decimals || decimals === '*' ? '' : ` ${ decimals}`} casas decimais.`,
  digits: (field, [length]) => `O campo ${field} deve ser numérico e ter ${length} dígitos.`,
  dimensions: (field, [width, height]) => `O campo ${field} deve ter ${width} pixels de largura por ${height} pixels de altura.`,
  email: field => `O campo ${field} deve ser um e-mail válido.`,
  excluded: field => `O campo ${field} deve ser um valor válido.`,
  ext: field => `O campo ${field} deve ser válido.`,
  image: field => `O campo ${field} deve ser uma imagem.`,
  included: field => `O campo ${field} deve ter um valor válido.`,
  ip: field => `O campo ${field} deve ser um endereço de IP válido.`,
  is: field => `O valor inserido no campo ${field} não é válido.`,
  max: (field, [length]) => `O campo ${field} não pode ter mais que ${length} caracteres.`,
  max_value: (field, [max]) => `O campo ${field} precisa ser ${max} ou menor.`,
  mimes: field => `O campo ${field} precisa ser válido.`,
  min: (field, [length]) => `O campo ${field} deve conter pelo menos ${length} caracteres.`,
  min_value: (field, [min]) => `O campo ${field} precisa ser ${min} ou maior.`,
  numeric: field => `O campo ${field} deve conter apenas números`,
  regex: field => `O campo ${field} possui um formato inválido.`,
  required: field => `O campo ${field} é obrigatório.`,
  url: field => `O campo ${field} não é uma URL válida.`,
  regionInSelection: 'Por favor, selecione uma região.',
  uniqueTokenName: 'Já existe um token com esse nome.',
  uniqueRules: 'Já existe uma regra com esses valores.',
  invitationCode: 'Este código VIP não é válido.',
};

const locale = {
  name: 'pt_PT',
  custom,
  messages,
  attributes: {},
};

export default locale;
