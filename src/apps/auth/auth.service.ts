function removeSensitiveUserData(user) {
    const { password, tokenIds, forgotUuid, forgotUuidExpiry, ...rest } = user.toObject();
    return rest;
}
export { removeSensitiveUserData };
