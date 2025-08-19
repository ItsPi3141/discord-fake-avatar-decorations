// https://github.com/davidmz/apng-js/blob/master/src/library/parser.js

/**
 * @param {ArrayBuffer} buffer
 * @return {number}
 */
export const getAPngDuration = (buffer) => {
  const bytes = new Uint8Array(buffer);

  let isAnimated = false;
  eachChunk(bytes, (type) => {
    isAnimated = type === "acTL";
    return !isAnimated;
  });
  if (!isAnimated) {
    return 1 / 1000;
  }

  let playTime = 0;
  eachChunk(bytes, (type, bytes, off) => {
    const dv = new DataView(bytes.buffer);
    if (type === "fcTL") {
      var delayN = dv.getUint16(off + 8 + 20);
      var delayD = dv.getUint16(off + 8 + 22);
      if (delayD === 0) {
        delayD = 100;
      }
      let delay = (1000 * delayN) / delayD;
      // https://bugzilla.mozilla.org/show_bug.cgi?id=125137
      // https://bugzilla.mozilla.org/show_bug.cgi?id=139677
      // https://bugzilla.mozilla.org/show_bug.cgi?id=207059
      if (delay <= 10) {
        delay = 100;
      }
      playTime += delay;
    }
    return true;
  });
  return playTime / 1000;
};

/**
 * @param {Uint8Array} bytes
 * @param {function(string, Uint8Array, number, number): boolean} callback
 */
const eachChunk = (bytes, callback) => {
  const dv = new DataView(bytes.buffer);
  let off = 8,
    type,
    length,
    res;
  do {
    length = dv.getUint32(off);
    type = readString(bytes, off + 4, 4);
    res = callback(type, bytes, off, length);
    off += 12 + length;
  } while (res !== false && type != "IEND" && off < bytes.length);
};

/**
 * @param {Uint8Array} bytes
 * @param {number} off
 * @param {number} length
 * @return {string}
 */
const readString = (bytes, off, length) => {
  const chars = Array.prototype.slice.call(bytes.subarray(off, off + length));
  return String.fromCharCode.apply(String, chars);
};
