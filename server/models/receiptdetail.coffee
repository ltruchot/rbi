americano = require("americano")
module.exports = ReceiptDetail = americano.getModel "receiptdetail",
  origin: String
  order: Number
  barcode: String
  label: String
  family: String
  familyLabel: String
  section: String
  sectionLabel: String
  amount: Number
  price: Number
  type: String
  typeLabel: String
  receiptId: String
  intermarcheShopId: String
  timestamp: Date
  isOnlineBuy: Boolean

  #
  aggregatedSection: String
  quantityUnit: String
  quantityAmount: Number
  quantityWeight: String
  quantityLabel: String
  name: String

ReceiptDetail.touch = ->
  cbGen = (reqName) ->
    startTime = Date.now()
    ->
      console.log "Touch " + reqName + " in " + (Date.now() - startTime) + "ms"
      return

  params =
    limit: 1
    reduce: false

  ReceiptDetail.rawRequest "byBarcode", params, cbGen("receiptdetail/byBarcode")
  ReceiptDetail.rawRequest "byReceiptId", params, cbGen("receiptdetail/byReceiptId")
  return

ReceiptDetail._ean13CheckSum = (rdet) ->
  if rdet.barcode and rdet.barcode.length is 12

    # last checksum digit is needed
    # cf : http://fr.wikipedia.org/wiki/Code-barres_EAN#Cl.C3.A9_de_contr.C3.B4le
    even = 0
    odd = 0
    i = 0

    while i < 6
      odd += parseInt(rdet.barcode[2 * i])
      even += parseInt(rdet.barcode[2 * i + 1])
      i++
    checksum = 10 - (3 * even + odd) % 10
    rdet.barcode = rdet.barcode + checksum.toString()
  return

ReceiptDetail._enrichReceiptDetail = (rdet) ->

  # Parse quantity
  # Match parterns : 3x20cl ; 8x1l ; 70cl ; 6x50 cl ; 180gx3

  # 3x : (\d+)x
  # 3x or not : (?:(\d+)x|())
  #
  # units : (cl|g|l|ml|m)
  #
  # x3 : (?:x(\d+)|())

  # g1 : mult
  # g2 : quantity
  # g3 : unit
  # g4 : mult
  reg = /(?:(\d+)x|)(\d+)(cl|g|l|ml|m|kg)(?:x(\d+)|)/i
  unitMap =
    CL: "cL"
    ML: "mL"
    M: "ML"
    L: "L"
    G: "g"
    KG: "kg"

  grs = reg.exec(rdet.label)
  if grs
    rdet.quantityUnit = (if (grs[3] of unitMap) then unitMap[grs[3]] else grs[3])
    rdet.quantityAmount = parseInt((if grs[1] then grs[1] else grs[4]))
    rdet.quantityWeight = parseInt(grs[2])
    rdet.quantityLabel = grs[0]
    if rdet.quantityAmount
      rdet.quantityTotalWeight = rdet.quantityWeight * rdet.quantityAmount
      rdet.quantityLabel = rdet.quantityAmount + "x" + rdet.quantityWeight + rdet.quantityUnit
    else
      rdet.quantityTotalWeight = rdet.quantityWeight
      rdet.quantityLabel = rdet.quantityWeight + rdet.quantityUnit

    # remove from label
    #rdet.name = rdet.label.substring(grs['index'], grs[0].length);
    rdet.name = rdet.label.substring(0, grs["index"])
  else if rdet.label is "NR" or rdet.label is "NA" or not rdet.label
    rdet.name = rdet.familyLabel
  else
    rdet.name = rdet.label

  # Clean name look.
  # to lower.
  # points -> spaces.
  rdet.name = rdet.name.toLowerCase().replace(".", " ")  if rdet.name
  rdet.aggregatedSection = ReceiptDetail.aggregateSections(rdet.section)

  #console.log(rdet.label);
  #console.log(rdet.name);
  #console.log(rdet.quantityLabel);
  #console.log('/n');
  rdet

ReceiptDetail.afterInitialize = ->
  ReceiptDetail._enrichReceiptDetail this
  ReceiptDetail._ean13CheckSum this
  return

ReceiptDetail.sectionsIdLabelMap =
  12: "BOUL PAT TRAD"
  10: "FROMAGE TRAD"
  70: "NON COMMERCIALE"
  38: "SURGELES"
  66: "PRESTATION DE SERVICE"
  50: "TEXTILE"
  28: "SAURISSERIE"
  44: "ALIMENTATION POUR ANIMAUX"
  48: "D.P.H."
  60: "BAZAR LEGER"
  30: "CREMERIE LS"
  22: "BOUCHERIE FRAIS EMB."
  32: "PAIN PAT LS INDUS"
  20: "BOUCHERIE LS"
  34: "FRUITS ET LEGUMES"
  26: "CHARCUTERIE TRAITEUR LS"
  36: "FLEURS ET PLANTES"
  24: "VOLAILLE LS"
  2: "BOUCHERIE / VOLAILLE TRAD"
  46: "LIQUIDES"
  4: "CHARCUTERIE TRAD"
  6: "TRAITEUR TRAD"
  88: "BOUTIQUE SERVICES"
  8: "PRODUITS DE LA MER TRAD"
  40: "EPICERIE SUCREE"
  42: "EPICERIE SALEE"
  64: "PRODUITS CULTURELS"
  80: "BOUTIQUE STATION"
  82: "BOUTIQUE PRESSE"
  62: "BAZAR TECHNIQUE"
  200: "BOUCHERIE"
  120: "BOULANGERIE"
  260: "CHARCUTERIE"
  280: "POISSONERIE"

ReceiptDetail.getSectionLabel = (sectionId) ->
  sectionId = String(sectionId)
  if sectionId of ReceiptDetail.sectionsIdLabelMap
    ReceiptDetail.sectionsIdLabelMap[sectionId]
  else
    "AUTRE"

ReceiptDetail.aggregateSections = (sectionId) ->
  aggSectionMap =

    #"VOLAILLE LS": "BOUCHERIE",
    24: "200"

    #"BOUCHERIE LS": "BOUCHERIE",
    20: "200"

    #"BOUCHERIE FRAIS EMB.": "BOUCHERIE",
    22: "200"

    #"BOUCHERIE / VOLAILLE TRAD": "BOUCHERIE",
    2: "200"

    #"BOUL PAT TRAD": "BOULANGERIE",
    12: "120"

    #"PAIN PAT LS INDUS": "BOULANGERIE",
    32: "120"

    #"CHARCUTERIE TRAITEUR LS": "CHARCUTERIE",
    26: "260"

    #"CHARCUTERIE TRAD": "CHARCUTERIE",
    4: "260"

    #"PRODUITS DE LA MER TRAD": "POISSONERIE",
    8: "280"

    #"SAURISSERIE": "POISSONERIE"
    28: "280"

  if sectionId of aggSectionMap
    aggSectionMap[sectionId]
  else
    sectionId

ReceiptDetail.getOneByBarCode = (barcode, callback) ->
  ReceiptDetail.request "byBarcode",
    key: barcode
    limit: 1
  , callback
  return

ReceiptDetail.withReceiptId = (receiptId, callback) ->
  ReceiptDetail.request "byReceiptId",
    keys: [
      receiptId
      receiptId.slice(0, -1)
    ]
  , (err, instances) ->
    callback null, instances
    return

  return
