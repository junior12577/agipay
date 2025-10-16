function tlv(id: string, value: string) {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

function crc16(payload: string) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function buildPixEMV(chave: string, valor: string, descricao: string) {
  const amountDots = valor.replace(/\./g, "").replace(",", ".");
  const mai = tlv("00", "BR.GOV.BCB.PIX") + tlv("01", chave) + (descricao ? tlv("02", descricao) : "");
  const poi = amountDots && Number(amountDots) > 0 ? "12" : "11";
  let data = "";
  data += tlv("00", "01");
  data += tlv("01", poi);
  data += tlv("26", mai);
  data += tlv("52", "0000");
  data += tlv("53", "986");
  if (amountDots && Number(amountDots) > 0) data += tlv("54", Number(amountDots).toFixed(2));
  data += tlv("58", "BR");
  data += tlv("59", "AGIPAY");
  data += tlv("60", "BRASILIA");
  const adf = descricao ? tlv("05", descricao) : "";
  if (adf) data += tlv("62", adf);
  const toCRC = data + "63" + "04";
  const crc = crc16(toCRC);
  return data + tlv("63", crc);
}
