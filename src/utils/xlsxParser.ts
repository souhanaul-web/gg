import * as XLSX from 'xlsx';
import { XMLContract } from '../types';

export const parseXLSXFile = (file: File): Promise<XMLContract[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Prendre la première feuille
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        console.log('📊 Analyse du fichier XLSX:');
        console.log('  Nom de la feuille:', sheetName);
        
        // Convertir en JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        console.log('  Nombre de lignes:', jsonData.length);
        console.log('  En-têtes (ligne 1):', jsonData[0]);
        console.log('  Première ligne de données:', jsonData[1]);
        
        const contracts: XMLContract[] = [];
        
        // Ignorer la première ligne (en-têtes) et traiter les données
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          
          if (row && row.length >= 4) {
            const contractNumber = row[0]?.toString() || '';
            const premiumStr = row[1]?.toString() || '0';
            const premium = parseFloat(premiumStr.replace(',', '.'));
            const maturity = row[2]?.toString() || '';
            const insured = row[3]?.toString() || '';
            
            console.log(`  Ligne ${i + 1}:`, {
              contractNumber,
              premiumStr,
              premium,
              maturity,
              insured,
              isValidPremium: !isNaN(premium)
            });
            
            if (contractNumber) {
              contracts.push({
                contractNumber,
                premium,
                maturity,
                insured
              });
            }
          }
        }
        
        console.log('✅ Parsing terminé:', contracts.length, 'contrats extraits');
        resolve(contracts);
      } catch (error) {
        console.error('❌ Erreur lors du parsing XLSX:', error);
        reject(new Error('Erreur lors du parsing du fichier XLSX: ' + (error as Error).message));
      }
    };
    
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
    reader.readAsArrayBuffer(file);
  });
};

export const findContractInXLSX = (contracts: XMLContract[], contractNumber: string): XMLContract | null => {
  return contracts.find(contract => contract.contractNumber === contractNumber) || null;
};
