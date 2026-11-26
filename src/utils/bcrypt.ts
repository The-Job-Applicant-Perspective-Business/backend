import bcrypt from "bcrypt";
const hashPassword = async (password) => {
    const saltrounds = 12;
    const salt = await bcrypt.genSalt(saltrounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
};
const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};
export { hashPassword, comparePassword };
