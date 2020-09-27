// Allow end-users to query info
// TODO: add id='queryFormBtn' to the submit query btn, and other ids
const queryFormBtn = Document.getElementById("queryFormBtn");

queryFormBtn.addEventListener("click", async function (e) {
  window.dispatchEvent("startLoad");
  const vin = Document.getElementById("vin").value.toUpperCase();
  const part = Document.getElementById("part").value.toUpperCase();

  try {
    const response = await queryPart({ vin, part }, env);
    const { x, y, dealerName, dealerAddr, stockNum, manufactureYr } = response;
      // TODO: CHANGE THIS ^ B/C IDK THE STRUCTURE OF RESPONSE RIGHT NOW
    // Page redirect to result
    window.location.href = window.location.href + "/Sub-Pages/result.html";
      // 'result.html' == page displaying query result
    Document.getElementById("vin").value = vin;
    Document.getElementById("part").value = part;
    Document.getElementById("dealerName").value = dealerName;
    Document.getElementById("dealerAddr").value = dealerAddr;
    Document.getElementById("stockNum").value = stockNum;
    Document.getElementById("manufactureYr").value = manufactureYr;
  } catch (err) {
    console.log(err);
    window.dispatchEvent("invalid");
  } finally {
    window.dispatchEvent("finishLoad");
  }
});
