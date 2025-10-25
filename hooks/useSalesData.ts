import { Sale, SalesMetrics } from '../types';

export const parseCSVToSales = (csvText: string): Sale[] => {
  // 1. Sanitize input and split into lines
  let sanitizedCsvText = csvText.trim().replace(/\r/g, '');
  // Remove BOM if present
  if (sanitizedCsvText.charCodeAt(0) === 0xFEFF) {
    sanitizedCsvText = sanitizedCsvText.substring(1);
  }
  
  const lines = sanitizedCsvText.split('\n');
  if (lines.length < 2) {
      return [];
  }

  // 2. Detect delimiter (comma or semicolon)
  const headerLine = lines[0];
  const commaCount = (headerLine.match(/,/g) || []).length;
  const semicolonCount = (headerLine.match(/;/g) || []).length;
  const delimiter = semicolonCount > commaCount ? ';' : ',';

  // 3. Process headers (normalize: lowercase, trimmed, quotes removed, symbols to spaces)
  const headers = headerLine.split(delimiter).map(h => 
    h.trim()
     .toLowerCase()
     .replace(/^"|"$/g, '')
     .replace(/[._]/g, ' ')
     .replace(/\s+/g, ' ')
     .trim()
  );
  const dataLines = lines.slice(1);
  
  // 4. Find required header indices using aliases for flexibility
  const headerAliases = {
    product: ['product', 'produto'],
    quantity: ['quantity', 'quantidade', 'qtd'],
    price: ['price', 'preco', 'preço', 'valor', 'valor unitário', 'valor unitario', 'preço unitário', 'preco unitario', 'unit price'],
    date: ['date', 'data'],
    category: ['category', 'categoria'],
    region: ['region', 'regiao', 'região']
  };

  const requiredCoreHeaders = ['product', 'quantity', 'price', 'date'];
  const headerMap: { [key: string]: number } = {};
  const missingHeaders: string[] = [];
  
  requiredCoreHeaders.forEach(coreHeader => {
      const aliases = headerAliases[coreHeader as keyof typeof headerAliases];
      const index = headers.findIndex(h => aliases.includes(h));
      if (index === -1) {
          missingHeaders.push(coreHeader);
      } else {
          headerMap[coreHeader] = index;
      }
  });

  if (missingHeaders.length > 0) {
      throw new Error(`Colunas essenciais não encontradas: ${missingHeaders.join(', ')}.`);
  }

  // Find optional headers
  const findOptionalHeader = (aliases: string[]): number => {
    return headers.findIndex(h => aliases.includes(h));
  };
  headerMap['id'] = findOptionalHeader(['id']);
  headerMap['transactionid'] = findOptionalHeader(['transactionid', 'transaction id']);
  headerMap['category'] = findOptionalHeader(headerAliases.category);
  headerMap['region'] = findOptionalHeader(headerAliases.region);
  
  const sales: Sale[] = [];

  // 5. Process data lines
  dataLines.forEach((line, index) => {
    if (!line.trim()) return;
    const values = line.split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));

    if (values.length !== headers.length) {
        console.warn(`Linha ${index + 2} ignorada: número de colunas (${values.length}) não corresponde ao cabeçalho (${headers.length}).`);
        return;
    }
    
    try {
      const quantityStr = values[headerMap['quantity']];
      const priceStr = values[headerMap['price']];

      if (!quantityStr || !priceStr || !values[headerMap['product']] || !values[headerMap['date']]) {
          console.warn(`Linha ${index + 2} ignorada: contém valores vazios para colunas obrigatórias.`);
          return;
      }
      
      const sale: Sale = {
        id: headerMap['id'] !== -1 ? values[headerMap['id']] : `row-${index + 1}`,
        date: values[headerMap['date']],
        product: values[headerMap['product']],
        quantity: parseInt(quantityStr, 10),
        price: parseFloat(priceStr.replace(',', '.')),
        transactionId: headerMap['transactionid'] !== -1 ? values[headerMap['transactionid']] : `trans-${index + 1}`,
        category: headerMap['category'] !== -1 ? values[headerMap['category']] : undefined,
        region: headerMap['region'] !== -1 ? values[headerMap['region']] : undefined,
      };

      if (sale.product && !isNaN(sale.quantity) && !isNaN(sale.price) && sale.date) {
         sales.push(sale);
      } else {
         console.warn(`Dados inválidos na linha ${index + 2}: ${line}`);
      }
    } catch (e) {
      console.warn(`Erro ao processar a linha ${index + 2}: ${line}`, e);
    }
  });

  return sales;
};


const PRODUCTS = ["Laptop Pro X", "Wireless Mouse Z", "4K Monitor", "Mechanical Keyboard", "USB-C Hub", "Webcam HD"];
const CATEGORIES = ["Eletrônicos", "Acessórios", "Periféricos"];
const REGIONS = ["Sudeste", "Nordeste", "Sul", "Centro-Oeste"];

const generateMockData = (month: number, year: number, products: string[], transactions: number): Sale[] => {
  const sales: Sale[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let i = 1; i <= transactions; i++) {
    const day = Math.floor(Math.random() * daysInMonth) + 1;
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const product = products[Math.floor(Math.random() * products.length)];
    const quantity = Math.floor(Math.random() * 3) + 1;
    const price = Math.random() * (2500 - 50) + 50;
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];
    
    sales.push({
      id: `${year}${month}${i}`,
      transactionId: `T${year}${month}${i}`,
      date,
      product,
      quantity,
      price: parseFloat(price.toFixed(2)),
      category,
      region,
    });
  }
  return sales;
};

export const MOCK_DATA_CATALOG = {
    "vendas_janeiro.csv": generateMockData(1, 2024, PRODUCTS, 150),
    "vendas_fevereiro.csv": generateMockData(2, 2024, PRODUCTS, 130),
    "vendas_marco.csv": generateMockData(3, 2024, PRODUCTS, 180),
    "vendas_abril.csv": generateMockData(4, 2024, PRODUCTS, 170),
    "vendas_maio.csv": generateMockData(5, 2024, PRODUCTS, 200),
    "vendas_junho.csv": generateMockData(6, 2024, PRODUCTS, 210),
    "vendas_julho.csv": generateMockData(7, 2024, PRODUCTS, 220),
    "vendas_agosto.csv": generateMockData(8, 2024, PRODUCTS, 190),
    "vendas_setembro.csv": generateMockData(9, 2024, PRODUCTS, 230),
    "vendas_outubro.csv": generateMockData(10, 2024, PRODUCTS, 250),
    "vendas_novembro.csv": generateMockData(11, 2024, PRODUCTS, 280),
    "vendas_dezembro.csv": generateMockData(12, 2024, PRODUCTS, 350),
};

export const processSalesData = (sales: Sale[]): SalesMetrics => {
  if (sales.length === 0) {
    return {
      totalSales: 0,
      averageTicket: 0,
      bestMonth: "N/A",
      bestSellingProduct: "N/A",
      analyzedPeriods: [],
      highestRevenueCategory: "N/A",
      mostProfitableRegion: "N/A",
      monthOverMonthChange: 0,
      salesByMonth: {},
      salesByProduct: {},
      salesByCategory: {},
      salesByRegion: {},
    };
  }

  const totalSales = sales.reduce((acc, sale) => acc + sale.price * sale.quantity, 0);

  const uniqueTransactions = new Set(sales.map(s => s.transactionId));
  const averageTicket = uniqueTransactions.size > 0 ? totalSales / uniqueTransactions.size : 0;

  const salesByMonth: { [key: string]: number } = {};
  const months = new Set<string>();
  sales.forEach(sale => {
    try {
      const saleDate = new Date(sale.date + 'T00:00:00');
      if (isNaN(saleDate.getTime())) throw new Error('Invalid date');
      const month = saleDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
      months.add(month);
      if (!salesByMonth[month]) salesByMonth[month] = 0;
      salesByMonth[month] += sale.price * sale.quantity;
    } catch(e) {
      console.warn(`Data inválida encontrada: ${sale.date}`);
    }
  });

  const bestMonth = Object.keys(salesByMonth).length > 0
    ? Object.entries(salesByMonth).sort(([, a], [, b]) => b - a)[0][0]
    : "N/A";
  const analyzedPeriods = Array.from(months);

  const salesByProduct: { [key: string]: number } = {};
  sales.forEach(sale => {
    if (!salesByProduct[sale.product]) salesByProduct[sale.product] = 0;
    salesByProduct[sale.product] += sale.quantity;
  });
  
  const bestSellingProduct = Object.keys(salesByProduct).length > 0
    ? Object.entries(salesByProduct).sort(([, a], [, b]) => b - a)[0][0]
    : "N/A";

  const salesByCategory: { [key: string]: number } = {};
  sales.forEach(sale => {
    if (sale.category) {
      if (!salesByCategory[sale.category]) salesByCategory[sale.category] = 0;
      salesByCategory[sale.category] += sale.price * sale.quantity;
    }
  });
  const highestRevenueCategory = Object.keys(salesByCategory).length > 0
    ? Object.entries(salesByCategory).sort(([, a], [, b]) => b - a)[0][0]
    : "N/A";

  const salesByRegion: { [key: string]: number } = {};
  sales.forEach(sale => {
    if (sale.region) {
      if (!salesByRegion[sale.region]) salesByRegion[sale.region] = 0;
      salesByRegion[sale.region] += sale.price * sale.quantity;
    }
  });
  const mostProfitableRegion = Object.keys(salesByRegion).length > 0
    ? Object.entries(salesByRegion).sort(([, a], [, b]) => b - a)[0][0]
    : "N/A";

  let monthOverMonthChange = 0;
  const monthMap: { [key: string]: number } = {
    'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3, 'maio': 4, 'junho': 5,
    'julho': 6, 'agosto': 7, 'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
  };
  const sortedMonths = Object.entries(salesByMonth).sort((a, b) => {
    const [monthStrA, yearA] = a[0].split(' de ');
    const [monthStrB, yearB] = b[0].split(' de ');
    const monthA = monthMap[monthStrA.toLowerCase() as keyof typeof monthMap];
    const monthB = monthMap[monthStrB.toLowerCase() as keyof typeof monthMap];
    const dateA = new Date(parseInt(yearA), monthA);
    const dateB = new Date(parseInt(yearB), monthB);
    return dateA.getTime() - dateB.getTime();
  });
  if (sortedMonths.length >= 2) {
    const lastMonthSales = sortedMonths[sortedMonths.length - 1][1];
    const secondLastMonthSales = sortedMonths[sortedMonths.length - 2][1];
    if (secondLastMonthSales > 0) {
      monthOverMonthChange = ((lastMonthSales - secondLastMonthSales) / secondLastMonthSales) * 100;
    }
  }

  return {
    totalSales,
    averageTicket,
    bestMonth,
    bestSellingProduct,
    analyzedPeriods,
    highestRevenueCategory,
    mostProfitableRegion,
    monthOverMonthChange,
    salesByMonth,
    salesByProduct,
    salesByCategory,
    salesByRegion,
  };
};