const pool = require("../config/database");
const slugify = require('slugify')

exports.getUsers = async (params) => {
    const { id } = params;
    const values = [];
    let whquery = "WHERE u.status=1";
    if (id) {
        values.push(id);
        whquery += ` AND u.id=$${values.length}`;
    }
    const data = await pool.query(`SELECT
         u.id, up.first_name, up.last_name, r.name role, u.email, u.phone 
        FROM users u 
        JOIN user_profile up    
        ON u.id=up.user_id
        JOIN user_roles ur
        ON u.id=ur.user_id
        JOIN roles r
        ON ur.role_id=r.id ${whquery}`, values);
    return data.rows;
}
exports.deleteUser = async (params) => {
    const { id } = params
    const data = await pool.query(`UPDATE users SET status=2 WHERE id=$1 RETURNING id, email`,
        [id]);
    return data.rows;
}
exports.createUser = async (data) => {
    const { email, phone, password, is_verified, profile, addresses, roles } = data
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const data = await client.query(`INSERT INTO users(email, phone, password, is_verified) VALUES ($1, $2, $3, $4) RETURNING id`,
            [email, phone, password, is_verified]);
        const user_id = data.rows[0].id;
        await client.query(`INSERT INTO user_profile(user_id, first_name, last_name, avatar_url) VALUES ($1, $2, $3, $4)`, [user_id, profile.first_name, profile.last_name, profile.avatar_url || null]);
        for (const address of addresses) {
            await client.query(`INSERT INTO addresses(user_id, name, phone, line1, line2, city, state, pincode, country, is_default) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
                [user_id, address.name, address.phone, address.line1, address.line2, address.city, address.state, address.pincode, address.country, address.is_default]);
        }
        for (const role of roles) {
            const roleData = await client.query(`SELECT id FROM roles WHERE id=$1`, [role]);
            if (roleData.rowCount === 0) throw { status: 404, message: "No such Role: " + role }
            await client.query(`INSERT INTO user_roles(user_id, role_id) VALUES ($1,$2)`, [user_id, roleData.rows[0].id]);
        }
        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
    return data.rows;
}

// {
//     "email": "abhi@gmail.com",
//     "phone": "9325924134",
//     "password": "abhishek",
//     "status": "active",
//     "is_verified": true,
//     "profile": {
//         "first_name": "Abhishek",
//         "last_name": "Kute",
//         "avatar_url": null
//     },
//     "addresses": [
//         {
//             "name": "Rupesh",
//             "phone": "9594212288",
//             "line1": "House 8",
//             "line2": "Samruddhi nagar",
//             "city": "Ahmednagar",
//             "state": "Maharashtra",
//             "pincode": "414001",
//             "country": "India",
//             "is_default": true
//         }
//     ],
//     "roles": [
//         "customer"
//     ]
// }