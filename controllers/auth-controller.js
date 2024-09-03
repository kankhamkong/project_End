const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken')
const db = require("../models/db");

exports.register = async (req, res, next) => {
  const { username, password, confirmPassword, email } = req.body;
  try {
    // Validation
    //console.log(req.body);
    if (!(username && password && confirmPassword && email)) {
      return next(new Error("Fulfill all inputs"));
    }
    if (confirmPassword !== password) {
      throw new Error("Confirm password does not match");
    }

    // Check for existing user
    const existingUser = await db.user.findFirst({
      where: {
        OR: [{ username }, { email }]
      }
    });

    if (existingUser) {
      throw new Error("Username or Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 8);
    //console.log(hashedPassword);
    const data = {
      username,
      password: hashedPassword,
      email,
      role: 'User'
    };

    const rs = await db.user.create({ data });
    //console.log(rs);

    res.json({ msg: 'Register successful' });
  } catch (err) {
    next(err);
    //console.log(err);
  }
};

exports.registerdelivery = async (req, res, next) => {
  const { username, password, confirmPassword, email } = req.body;
  try {
    // Validation
    //console.log(req.body);
    if (!(username && password && confirmPassword && email)) {
      return next(new Error("Fulfill all inputs"));
    }
    if (confirmPassword !== password) {
      throw new Error("Confirm password does not match");
    }

    // Check for existing user
    const existingUser = await db.user.findFirst({
      where: {
        OR: [{ username }, { email }]
      }
    });

    if (existingUser) {
      throw new Error("Username or Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 8);
    //console.log(hashedPassword);
    const data = {
      username,
      password: hashedPassword,
      email,
      role: 'DELIVERY'
    };

    const rs = await db.user.create({ data });
    //console.log(rs);

    res.json({ msg: 'Register successful' });
  } catch (err) {
    next(err);
    //console.log(err);
  }
};

exports.login = async (req, res, next) => {
  const {username, password} = req.body
  try {
    // validation
    if( !(username.trim() && password.trim()) ) {
      throw new Error('username or password must not blank')
    }
    // find username in db.user
    const user = await db.user.findFirstOrThrow({ where : { username }})
    // check password
    const pwOk = await bcrypt.compare(password, user.password)
    if(!pwOk) {
      throw new Error('invalid login')
    }
    // issue jwt token 
    const payload = { id: user.id }
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '30d'
    })
    //console.log(token)
    res.json({token : token})
  }catch(err) {
    next(err)
  }
};

exports.getme = (req,res,next) => {
  try {
    res.json(req.user)
  }catch(err) {
    //console.log(err)
  }
}

exports.createProfileUser = async (req, res, next) => {
  try {
    const { realname, lastname, gender, phone } = req.body;
    const userId = parseInt(req.user.id)
    
    const newProfile = await db.profileuser.create({
      data: {
        userId,
        realname,
        lastname,
        gender: parseInt(gender),
        phone,
      },
    });

    res.json({ message: "Profile created successfully", newProfile });
  } catch (error) {
    next(error);
  }
};

exports.getProfileByUser = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const profile = await db.profileuser.findFirst({
      where: { userId: userId },
    });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json({ profile });
  } catch (error) {
    next(error);
  }
};


exports.updateProfileUser = async (req, res, next) => {
  try {
    const { id } = req.params; // Profile ID from the request parameters
    const { realname, lastname, gender, phone } = req.body;

    // Convert gender to an integer if it's a string
    const genderInt = parseInt(gender, 10);

    const updatedProfile = await db.profileuser.update({
      where: { id: +id },
      data: {
        realname,
        lastname,
        gender: genderInt, // Use the converted integer value
        phone,
      },
    });

    res.json({ message: "Profile updated successfully", updatedProfile });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await db.user.findMany({
      include: {
        Profileuser: true,
      },
    });

    res.json({ users });
  } catch (error) {
    next(error);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const { id } = req.params;

    // อัปเดต role ของผู้ใช้ในฐานข้อมูล
    const updatedUser = await db.user.update({
      where: { id:+id},
      data: { role: role },
    });

    res.json({ message: 'User role updated successfully', updatedUser });
  } catch (error) {
    next(error);
  }
};