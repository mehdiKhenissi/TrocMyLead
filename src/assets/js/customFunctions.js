/* STRTR FUNCTION */
function strtr(input, map) {
  // Crée une expression régulière à partir des clés de la table correspondante
  var regex = new RegExp(Object.keys(map).join('|'), 'g')
  // Remplace chaque occurrence dans la chaîne d'entrée par celle qui lui correspond dans la table de mappage
  return input.replace(regex, function (matched) {
    return map[matched]
  })
}

/* SIMPLIFIED STR */
export function simplifiedStr(string) {
  var unwanted_array = {
    Š: 'S',
    š: 's',
    Ž: 'Z',
    ž: 'z',
    À: 'A',
    Á: 'A',
    Â: 'A',
    Ã: 'A',
    Ä: 'A',
    Å: 'A',
    Æ: 'A',
    Ç: 'C',
    È: 'E',
    É: 'E',
    Ê: 'E',
    Ë: 'E',
    Ì: 'I',
    Í: 'I',
    Î: 'I',
    Ï: 'I',
    Ñ: 'N',
    Ò: 'O',
    Ó: 'O',
    Ô: 'O',
    Õ: 'O',
    Ö: 'O',
    Ø: 'O',
    Ù: 'U',
    Ú: 'U',
    Û: 'U',
    Ü: 'U',
    Ý: 'Y',
    Þ: 'B',
    ß: 'Ss',
    à: 'a',
    á: 'a',
    â: 'a',
    ã: 'a',
    ä: 'a',
    å: 'a',
    æ: 'a',
    ç: 'c',
    è: 'e',
    é: 'e',
    ê: 'e',
    ë: 'e',
    ì: 'i',
    í: 'i',
    î: 'i',
    ï: 'i',
    ð: 'o',
    ñ: 'n',
    ò: 'o',
    ó: 'o',
    ô: 'o',
    õ: 'o',
    ö: 'o',
    ø: 'o',
    ù: 'u',
    ú: 'u',
    û: 'u',
    ý: 'y',
    þ: 'b',
    ÿ: 'y'
  }

  //return strtr( string.toLowerCase().replaceAll(/[^\w]/i, '_'), unwanted_array );
  return strtr(string.toLowerCase().replaceAll(/ /g, '_'), unwanted_array)
}

/** to date string FR */
export function formatTimestampToDateString(timestamp) {
  //console.log(timestamp)
  if (!isNaN(timestamp)) {
    var date = new Date(timestamp * 1000)
    var options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false // Use 24-hour format
    }

    var formattedDate = new Intl.DateTimeFormat('fr-FR', options).format(date)
    return formattedDate.replace(/(\d+)\/(\d+)\/(\d+), (\d+):(\d+):(\d+)/, '$3-$1-$2 $4:$5:$6')
  }
}

/** to date string EN */
export function formatDateToISOString(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0') // Month is 0-indexed
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}`
}

/** string contains */
export function stringContains(str, searchString) {
  // Convert both strings to lowercase (or uppercase) before comparison
  const lowerCaseStr = ((str.toString()).toLowerCase()).trim()
  const lowerCaseSearchString = (searchString.toLowerCase()).trim()

  // Check if the lowercase string contains the lowercase search string
  return lowerCaseStr.includes(lowerCaseSearchString)
}
