import { PrismaClient } from '@prisma/client';
import { hash, compare} from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

interface AuthResult {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export async function authenticateUser(
  email: string,
  password: string,
  isRegistration: boolean,
  name?: string,
): Promise<AuthResult> {
  try {
    if (isRegistration) {
      // Check if user already exists
      const existingUser = await prisma.operator.findUnique({ where: { email } });
      if (existingUser) {
        return { success: false, message: 'User already exists' };
      }

      // Hash the password
      const hashedPassword = await hash(password, 10);

      // Create new user
      const newUser = await prisma.operator.create({
        data: {
          name: name!,
          email,
          password: hashedPassword,
        },
      });

      const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET!, { expiresIn: '1d' });

      return {
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      };
    } else {
      // Login
      const user = await prisma.operator.findUnique({ where: { email } });
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      const isPasswordValid = await compare(password, user.password);
      if (!isPasswordValid) {
        return { success: false, message: 'Invalid password' };
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '1d' });


      return {
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    }
  } catch (error) {
    return { success: false, message: 'An error occurred during authentication' };
  } finally {
    await prisma.$disconnect();
  }
}