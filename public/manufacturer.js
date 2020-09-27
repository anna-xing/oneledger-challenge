
// Helper function for maintaining acc balance
async function maintainBalance(addr) {
  let balance = await queryAccount({ addr }, env);
  balance = balance.OLT;
  if (balance <= 0) await requestTestOLT(addr);
}

// Allow manufacturers to upload info
// TODO: add id='uploadFormBtn' to the submit btn
//   add appropriate id tags to the form fields
const uploadFormBtn = Document.getElementById("uploadFormBtn");

uploadFormBtn.addEventListener("click", async function (e) {
  window.dispatchEvent("startLoad");
  const vin = Document.getElementById("vin").value.toUpperCase();
  const part = Document.getElementById("part").value.toUpperCase();
  // TODO: how can we standardize the parts??
  const dealerName = Document.getElementById("dealerName").value.toUpperCase();
  const stockNum = Document.getElementById("stockNum").value.toUpperCase();
  const dealerAddr = Document.getElementById("dealerAddr").value.toUpperCase();
  const manufactureYr = parseInt(
    Document.getElementById("manufactureYr").value
  );

  try {
    const address = localGet("address");
    const rawTx = await addPartTxs(
      {
        vin,
        part,
        dealerName,
        dealerAddr,
        stockNum,
        manufactureYr,
        address,
      },
      env
    );
    const emks = localGet("encryptedMasterKeySeed");
    const signature = await sign(rawTx, emks);
    const publicKey = localGet("publicKey");
    await broadcastTx({ publicKey, rawTx, signature }, env);
    maintainBalance(localGet("address"));
    // confirmUpload();
  } catch (err) {
    console.log(err);
    window.dispatchEvent("invalid");
  } finally {
    window.dispatchEvent("finishLoad");
  }
});