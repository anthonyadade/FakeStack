import mongoose from 'mongoose';
import supertest from 'supertest';
import { app } from '../../app';
import * as util from '../../services/message.service';
import { DatabaseMessage, Message } from '../../types/types';

const saveMessageSpy = jest.spyOn(util, 'saveMessage');
const getMessagesSpy = jest.spyOn(util, 'getMessages');
const updateMessageSpy = jest.spyOn(util, 'updateMessage');

describe('POST /addMessage', () => {
  it('should add a new message', async () => {
    const validId = new mongoose.Types.ObjectId();

    const requestMessage: Message = {
      msg: 'Hello',
      msgFrom: 'User1',
      msgDateTime: new Date('2024-06-04'),
      type: 'global',
      readBy: [],
    };

    const message: DatabaseMessage = {
      ...requestMessage,
      _id: validId,
    };

    saveMessageSpy.mockResolvedValue(message);

    const response = await supertest(app)
      .post('/messaging/addMessage')
      .send({ messageToAdd: requestMessage });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      _id: message._id.toString(),
      msg: message.msg,
      msgFrom: message.msgFrom,
      msgDateTime: message.msgDateTime.toISOString(),
      type: 'global',
      readBy: [],
    });
  });

  it('should return bad request error if messageToAdd is missing', async () => {
    const response = await supertest(app).post('/messaging/addMessage').send({});

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid request');
  });

  it('should return bad message body error if msg is empty', async () => {
    const badMessage = {
      msg: '',
      msgFrom: 'User1',
      msgDateTime: new Date('2024-06-04'),
    };

    const response = await supertest(app)
      .post('/messaging/addMessage')
      .send({ messageToAdd: badMessage });

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid message body');
  });

  it('should return bad message body error if msg is missing', async () => {
    const badMessage = {
      msgFrom: 'User1',
      msgDateTime: new Date('2024-06-04'),
    };

    const response = await supertest(app)
      .post('/messaging/addMessage')
      .send({ messageToAdd: badMessage });

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid message body');
  });

  it('should return bad message body error if msgFrom is empty', async () => {
    const badMessage = {
      msg: 'Hello',
      msgFrom: '',
      msgDateTime: new Date('2024-06-04'),
    };

    const response = await supertest(app)
      .post('/messaging/addMessage')
      .send({ messageToAdd: badMessage });

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid message body');
  });

  it('should return bad message body error if msgFrom is missing', async () => {
    const badMessage = {
      msg: 'Hello',
      msgDateTime: new Date('2024-06-04'),
    };

    const response = await supertest(app)
      .post('/messaging/addMessage')
      .send({ messageToAdd: badMessage });

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid message body');
  });

  it('should return bad message body error if msgDateTime is missing', async () => {
    const badMessage = {
      msg: 'Hello',
      msgFrom: 'User1',
    };

    const response = await supertest(app)
      .post('/messaging/addMessage')
      .send({ messageToAdd: badMessage });

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid message body');
  });

  it('should return bad message body error if msgDateTime is null', async () => {
    const badMessage = {
      msg: 'Hello',
      msgFrom: 'User1',
      msgDateTime: null,
    };

    const response = await supertest(app)
      .post('/messaging/addMessage')
      .send({ messageToAdd: badMessage });

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid message body');
  });

  it('should return internal server error if saveMessage fails', async () => {
    const validId = new mongoose.Types.ObjectId();
    const message = {
      _id: validId,
      msg: 'Hello',
      msgFrom: 'User1',
      msgDateTime: new Date('2024-06-04'),
    };

    saveMessageSpy.mockResolvedValue({ error: 'Error saving document' });

    const response = await supertest(app)
      .post('/messaging/addMessage')
      .send({ messageToAdd: message });

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when adding a message: Error saving document');
  });
});

describe('GET /getMessages', () => {
  it('should return all messages', async () => {
    const message1: Message = {
      msg: 'Hello',
      msgFrom: 'User1',
      msgDateTime: new Date('2024-06-04'),
      type: 'global',
      readBy: [],
    };

    const message2: Message = {
      msg: 'Hi',
      msgFrom: 'User2',
      msgDateTime: new Date('2024-06-05'),
      type: 'global',
      readBy: [],
    };

    const dbMessage1: DatabaseMessage = {
      ...message1,
      _id: new mongoose.Types.ObjectId(),
    };

    const dbMessage2: DatabaseMessage = {
      ...message2,
      _id: new mongoose.Types.ObjectId(),
    };

    getMessagesSpy.mockResolvedValue([dbMessage1, dbMessage2]);

    const response = await supertest(app).get('/messaging/getMessages');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        ...dbMessage1,
        _id: dbMessage1._id.toString(),
        msgDateTime: dbMessage1.msgDateTime.toISOString(),
      },
      {
        ...dbMessage2,
        _id: dbMessage2._id.toString(),
        msgDateTime: dbMessage2.msgDateTime.toISOString(),
      },
    ]);
  });

  describe('PATCH /updateMessage/:id', () => {
    it('should add a new message', async () => {
      const validId = new mongoose.Types.ObjectId();

      const requestMessage: Message = {
        msg: 'Hello',
        msgFrom: 'User1',
        msgDateTime: new Date('2024-06-04'),
        type: 'global',
        readBy: [],
      };

      const updatedMessage: DatabaseMessage = {
        ...requestMessage,
        _id: new mongoose.Types.ObjectId(),
        readBy: ['User2', 'User3'],
      };

      updateMessageSpy.mockResolvedValue(updatedMessage);

      const response = await supertest(app)
        .patch(`/messaging/updateMessage/${validId}`)
        .send({ messageToUpdate: requestMessage });

      // console.log(response);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        _id: updatedMessage._id.toString(),
        msg: updatedMessage.msg,
        msgFrom: updatedMessage.msgFrom,
        msgDateTime: updatedMessage.msgDateTime.toISOString(),
        type: 'global',
        readBy: ['User2', 'User3'],
      });
    });
    it('should update a message successfully', async () => {
      const validId = new mongoose.Types.ObjectId();

      const messageToUpdate: DatabaseMessage = {
        _id: validId,
        msg: 'Hello',
        msgFrom: 'User1',
        msgDateTime: new Date('2024-06-04'),
        type: 'global',
        readBy: ['User2'],
      };

      const updatedMessage: DatabaseMessage = {
        ...messageToUpdate,
        readBy: ['User2', 'User3'], // Simulate adding a new user to the `readBy` array
      };

      updateMessageSpy.mockResolvedValue(updatedMessage);

      const response = await supertest(app)
        .patch(`/messaging/updateMessage/${validId}`)
        .send({ messageToUpdate });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        _id: updatedMessage._id.toString(),
        msg: updatedMessage.msg,
        msgFrom: updatedMessage.msgFrom,
        msgDateTime: updatedMessage.msgDateTime.toISOString(),
        type: updatedMessage.type,
        readBy: updatedMessage.readBy,
      });
    });

    it('should return errorif messageToUpdate is missing', async () => {
      const validId = new mongoose.Types.ObjectId();

      const response = await supertest(app).patch(`/messaging/updateMessage/${validId}`).send({});

      expect(response.status).toBe(500);
      expect(response.text).toContain(
        'Error when updating a message: Cannot read properties of undefined',
      );
    });

    it('should return internal server error if updateMessage fails', async () => {
      const validId = new mongoose.Types.ObjectId();

      const messageToUpdate: DatabaseMessage = {
        _id: validId,
        msg: 'Hello',
        msgFrom: 'User1',
        msgDateTime: new Date('2024-06-04'),
        type: 'global',
        readBy: ['User2'],
      };

      updateMessageSpy.mockResolvedValue({ error: 'Error updating document' });

      const response = await supertest(app)
        .patch(`/messaging/updateMessage/${validId}`)
        .send({ messageToUpdate });

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error when updating a message: Error updating document');
    });

    it('should return internal server error if an exception is thrown', async () => {
      const validId = new mongoose.Types.ObjectId();

      const messageToUpdate: DatabaseMessage = {
        _id: validId,
        msg: 'Hello',
        msgFrom: 'User1',
        msgDateTime: new Date('2024-06-04'),
        type: 'global',
        readBy: ['User2'],
      };

      updateMessageSpy.mockRejectedValue(new Error('Unexpected error'));

      const response = await supertest(app)
        .patch(`/messaging/updateMessage/${validId}`)
        .send({ messageToUpdate });

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error when updating a message: Unexpected error');
    });
  });
});
