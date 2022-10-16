const shortid = require('shortid');

/**
 * Tạo 1 id bằng cách lấy thời gian lúc gọi hàm (dạng số) + 1 short id
 * @returns Trả về 1 chuỗi id
 */
const generateId = () => `${new Date().getTime()}${shortid.generate()}`;

module.exports = { generateId };
