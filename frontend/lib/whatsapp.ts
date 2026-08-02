export function buildWhatsAppMessage(link: string): string {
  return `Bonjour,\n\nDans le cadre d'un projet familial, nous mettons en place un arbre généalogique numérique afin de conserver et transmettre l'histoire de notre famille aux générations futures.\n\nNous sollicitons chaque chef de famille pour renseigner les informations concernant sa descendance : épouse(s), enfants, petits-enfants et autres descendants.\n\nMerci de remplir le formulaire avec les informations dont vous disposez. Si certaines dates ou informations ne sont pas connues avec précision, vous pouvez indiquer qu'elles sont approximatives ou inconnues.\n\nLien du formulaire :\n${link}\n\nLes données collectées seront utilisées uniquement dans le cadre familial, avec un accès limité aux membres autorisés.\n\nMerci pour votre contribution.`;
}

export function buildWhatsAppShareUrl(link: string): string {
  return `https://wa.me/?text=${encodeURIComponent(buildWhatsAppMessage(link))}`;
}
