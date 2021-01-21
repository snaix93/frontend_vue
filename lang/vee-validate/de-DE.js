function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const custom = {
    path: {
      regex: 'Bitte geben Sie nur den Pfad Ihrer Seite oder Script ein.',
    },
};

const messages = {
  _default: field => `${capitalize(field)} ist ungültig.`,
  after: (field, [target]) => `${capitalize(field)} muss nach ${target} liegen.`,
  alpha: field => `${capitalize(field)} darf nur alphabetische Zeichen enthalten.`,
  alpha_dash: field => `${capitalize(field)} darf alphanumerische Zeichen sowie Striche und Unterstriche enthalten.`,
  alpha_num: field => `${capitalize(field)} darf nur alphanumerische Zeichen enthalten.`,
  alpha_spaces: field => `${capitalize(field)} darf nur alphanumerische Zeichen und Leerzeichen enthalten.`,
  before: (field, [target]) => `${capitalize(field)} muss vor ${target} liegen.`,
  between: (field, [min, max]) => `${capitalize(field)} muss zwischen ${min} und ${max} liegen.`,
  confirmed: field => `Die Bestätigung der ${capitalize(field)} stimmt nicht überein`,
  credit_card: field => `${capitalize(field)} ist keine gültiger Wert für Kreditkarten.`,
  date_between: (field, [min, max]) => `${capitalize(field)} muss zwischen ${min} und ${max} liegen.`,
  date_format: (field, [format]) => `${capitalize(field)} muss das Format ${format} haben.`,
  decimal: (field, [decimals = '*'] = []) => `${capitalize(field)} muss numerisch sein und darf${!decimals || decimals === '*' ? '' : ` ${ decimals}`} Dezimalpunkte enthalten.`,
  digits: (field, [length]) => `${capitalize(field)} muss numerisch sein und exakt ${length} Ziffern enthalten.`,
  dimensions: (field, [width, height]) => `${capitalize(field)} muss ${width} x ${height} Bildpunkte groß sein.`,
  email: field => `${capitalize(field)} muss eine gültige E-Mail-Adresse sein.`,
  excluded: field => `${capitalize(field)} muss ein gültiger Wert sein.`,
  ext: field => `${capitalize(field)} muss eine gültige Datei sein.`,
  image: field => `${capitalize(field)} muss eine Grafik sein.`,
  included: field => `${capitalize(field)} muss ein gültiger Wert sein.`,
  integer: field => `${capitalize(field)} muss eine ganze Zahl sein.`,
  ip: field => `${capitalize(field)} muss eine gültige IP-Adresse sein.`,
  length: (field, [length, max]) => {
    if (max) {
      return `Die Länge von ${capitalize(field)} muss zwischen ${length} und ${max} liegen.`;
    }

    return `Die Länge von ${capitalize(field)} muss ${length} sein.`;
  },
  max: (field, [length]) => `${capitalize(field)} darf nicht länger als ${length} Zeichen sein.`,
  max_value: (field, [max]) => `${capitalize(field)} darf maximal ${max} sein.`,
  mimes: field => `${capitalize(field)} muss einen gültigen Dateityp haben.`,
  min: (field, [length]) => `${capitalize(field)} muss mindestens ${length} Zeichen lang sein.`,
  min_value: (field, [min]) => `${capitalize(field)} muss mindestens ${min} sein.`,
  numeric: field => `${capitalize(field)} darf nur numerische Zeichen enthalten.`,
  regex: field => `Das Format von ${capitalize(field)} ist ungültig.`,
  required: field => `${capitalize(field)} ist ein Pflichtfeld.`,
  required_if: field => `${capitalize(field)} ist ein Pflichtfeld.`,
  url: field => `${capitalize(field)} ist keine gültige URL.`,
  regionInSelection: 'Bitte wählen Sie eine Region aus.',
  uniqueTokenName: 'Es existiert bereits ein Token mit diesem Namen.',
  uniqueRules: 'Es existiert bereits eine Regel mit diesen Werten',
  invitationCode: 'Dieser VIP-Pass ist nicht gültig.',
};

const locale = {
  name: 'de',
  custom,
  messages,
  attributes: {},
};

export default locale;
