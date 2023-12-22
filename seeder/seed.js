import bcrypt from 'bcrypt';
import { User,validateUser } from '../model/user.js';

export async function createAdminUser() {
  try {
    const adminUserData = {
      firstName: 'Raja',
      lastName: 'Nouman',
      email: 'rajanouman2000@gmail.com',
      password: '12345678', // You can change this to a more secure password
      isAdmin: true,
      isVerified: true,
    };

    // Validate user input (optional, depends on your use case)
    const { error } = validateUser(adminUserData);
    if (error) {
      throw new Error(error.details[0].message);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminUserData.password, 10);
    adminUserData.password = hashedPassword;

    // Create the admin user in the database
    const adminUser = await User.create(adminUserData);

    console.log('Admin user created successfully:', adminUser.toJSON());
  } catch (error) {
    console.error('Error creating admin user:', error.message);
  }
}

export default { createAdminUser }

