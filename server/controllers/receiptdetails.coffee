ReceiptDetail = require("../models/receiptdetail")
module.exports.sections = (req, res) ->
  ReceiptDetail.withReceiptId req.params.receiptid, (err, instances) ->
    if err?
      res.send 500, "An error has occurred -- " + err
    else

      # Build a struct :
      #                [{
      #                    sectionLabel,
      #                    receiptDetails : []
      #                }]
      #

      # All receipts, by ticketId.
      sections = {}
      for idx of instances
        rdet = instances[idx]
        sectionNumber = rdet.aggregatedSection
        sectionLabel = ReceiptDetail.getSectionLabel(sectionNumber)
        section = 'undefined'
        if sectionNumber of sections
          section = sections[sectionNumber]
        else
          section =
            sectionLabel: sectionLabel
            section: sectionNumber
            receiptDetails: []

          sections[sectionNumber] = section
        section.receiptDetails.push rdet
      sectionList = []
      sectionNumbers = Object.keys(sections).sort()
      i = 0

      while i < sectionNumbers.length
        sectionList.push sections[sectionNumbers[i]]
        i++
      res.send 200, sectionList
    return

  return
