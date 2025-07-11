import { Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class DataRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectConnection() private connection: Connection
  ) {}

  async findAllUsers(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findUserByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async createUser(userData: Partial<User>): Promise<UserDocument> {
    const user = new this.userModel(userData);
    return user.save();
  }

  // Método para obtener todas las canciones importadas desde Excel
  async findAllCanciones(): Promise<any[]> {
    const cancionesCollection = this.connection.collection('canciones');
    return cancionesCollection.find({}).toArray();
  }

  // Método para obtener datos de cualquier colección
  async findAllFromCollection(collectionName: string): Promise<any[]> {
    const collection = this.connection.collection(collectionName);
    return collection.find({}).toArray();
  }

  // Método para listar todas las colecciones disponibles
  async getAllCollections(): Promise<string[]> {
    const collections = await this.connection.db.listCollections().toArray();
    return collections.map(col => col.name);
  }
}