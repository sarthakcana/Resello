const userService=require('../services/user.service.js');

exports.getUsers = async (req, res) => {
    const data = await userService.getUsers(req.params);
    res.status(200).json(data);
}
exports.deleteUser = async (req, res) => {
    const data = await userService.deleteUser(req.params);
    res.status(200).json(data);
}

exports.createUser = async (req, res) => {
    const data = await userService.createUser(req.body);
    res.status(200).json(data);
}