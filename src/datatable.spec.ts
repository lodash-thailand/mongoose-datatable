import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import Datatable, { IQuery } from './datatable';

const mongoUrl = `mongodb://localhost:4242/test-datatable`;
const mongoose = require('mongoose');
mongoose.plugin(Datatable.init);
const schema = new mongoose.Schema({ first_name: String, last_name: String, position: Number, start_date: Date });
const model = mongoose.model('Test', schema);

chai.use(chaiAsPromised);
const expect = chai.expect;

const query: IQuery = {
  draw: '2',
  columns: [
    { data: 'first_name', name: null, searchable: true, orderable: true, search: { value: null, regex: false } },
    { data: 'last_name', name: null, searchable: false, orderable: true, search: { value: null, regex: false } },
    { data: 'position', name: null, searchable: true, orderable: true, search: { value: null, regex: false } },
    { data: 'start_date', name: null, searchable: true, orderable: false, search: { value: null, regex: false } }
  ],
  order: [{ column: 0, dir: 'asc' }],
  start: '0',
  length: '10',
  search: { value: null, regex: false }
};

const nologger = { debug: () => { }, info: () => { }, warn: () => { }, error: () => { } } as any;

describe('Datatable Module', () => {

  describe('configure', () => {
    it(`should exists`, () => {
      expect(Datatable.configure)
        .to.not.be.undefined;
    });
    it(`should set config`, () => {
      let debug = '';
      const logger = { debug: (...data: any[]) => debug += data.join(', ') } as any;
      const config = Datatable.configure({ logger });
      expect(config)
        .to.have.property('logger', logger);
      expect(() => config.logger.debug('test'))
        .to.not.throw();
      expect(debug)
        .to.equals('test');
    });
  });

  describe('dataTable', () => {
    before(done => {
      mongoose.connect(mongoUrl, { useNewUrlParser: true });
      mongoose.connection.on('error', done);
      mongoose.connection.on('open', () => {
        model.insertMany([
          { first_name: 'Clement', last_name: 'Sadler', position: 1, start_date: new Date('2019.01.01') },
          { first_name: 'Saanvi', last_name: 'Meyers', position: 2, start_date: new Date('2019.01.02') },
          { first_name: 'Antonia', last_name: 'Watts', position: 3, start_date: new Date('2019.01.03') },
          { first_name: 'Eman', last_name: 'Pierce', position: 4, start_date: new Date('2019.01.04') },
          { first_name: 'Israel', last_name: 'Partridge', position: 5, start_date: new Date('2019.01.05') }
        ]).then(() => done()).catch(done);
      });
    });
    it('should list all data', async () => {
      Datatable.configure({ logger: nologger });
      return model.dataTable(query, {}).then((data: any) => {
        expect(data).to.not.be.null;
        expect(data.draw).to.be.equals('2');
        expect(data.data).to.have.lengthOf(5);
      });
    });
    after(() => {
      mongoose.connection.close();
    });
  });

});