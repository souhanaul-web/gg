import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Gift, AlertTriangle, Save, Plus, Trash2 } from 'lucide-react';
import { 
  saveDepense, 
  getDepenses, 
  saveRecetteExceptionnelle, 
  getRecettesExceptionnelles,
  saveRistourne,
  getRistournes,
  saveSinistre,
  getSinistres,
  checkRistourneExists,
  checkSinistreExists,
  type Depense,
  type RecetteExceptionnelle,
  type Ristourne,
  type Sinistre
} from '../utils/financialService';

interface FinancialManagementProps {
  username: string;
}

const FinancialManagement: React.FC<FinancialManagementProps> = ({ username }) => {
  const [activeSection, setActiveSection] = useState<'depenses' | 'recettes' | 'ristournes' | 'sinistres'>('depenses');
  
  // États pour les dépenses
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [newDepense, setNewDepense] = useState({
    type_depense: 'Frais Bureau',
    montant: '',
    date_depense: new Date().toISOString().split('T')[0]
  });

  // États pour les recettes exceptionnelles
  const [recettes, setRecettes] = useState<RecetteExceptionnelle[]>([]);
  const [newRecette, setNewRecette] = useState({
    type_recette: 'Hamza',
    montant: '',
    date_recette: new Date().toISOString().split('T')[0]
  });

  // États pour les ristournes
  const [ristournes, setRistournes] = useState<Ristourne[]>([]);
  const [newRistourne, setNewRistourne] = useState({
    numero_contrat: '',
    client: '',
    montant_ristourne: '',
    date_ristourne: new Date().toISOString().split('T')[0],
		date_paiement_ristourne:  new Date().toISOString().split('T')[0]
  });

  // États pour les sinistres
  const [sinistres, setSinistres] = useState<Sinistre[]>([]);
  const [newSinistre, setNewSinistre] = useState({
    numero_sinistre: '',
    montant: '',
    client: '',
    date_sinistre: new Date().toISOString().split('T')[0]
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Vérifier si l'utilisateur peut modifier les dates
  const canEditDates = username === 'Hamza';

  const sections = [
    { id: 'depenses', label: 'Dépenses', icon: TrendingDown, color: 'red' },
    { id: 'recettes', label: 'Recettes Exceptionnelles', icon: TrendingUp, color: 'green' },
    { id: 'ristournes', label: 'Ristournes', icon: Gift, color: 'purple' },
    { id: 'sinistres', label: 'Sinistres', icon: AlertTriangle, color: 'orange' }
  ];

  useEffect(() => {
    loadData();
  }, [activeSection]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      switch (activeSection) {
        case 'depenses':
          const depensesData = await getDepenses();
          setDepenses(depensesData);
          break;
        case 'recettes':
          const recettesData = await getRecettesExceptionnelles();
          setRecettes(recettesData);
          break;
        case 'ristournes':
          const ristournesData = await getRistournes();
          setRistournes(ristournesData);
          break;
        case 'sinistres':
          const sinistresData = await getSinistres();
          setSinistres(sinistresData);
          break;
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
    setIsLoading(false);
  };

  const handleSaveDepense = async () => {
    if (!newDepense.montant) {
      setMessage('Veuillez saisir un montant');
      return;
    }

    const depense: Depense = {
      type_depense: newDepense.type_depense,
      montant: parseFloat(newDepense.montant),
      date_depense: newDepense.date_depense,
      cree_par: username
    };

    const success = await saveDepense(depense);
    if (success) {
      setMessage('✅ Dépense enregistrée avec succès');
      setNewDepense({
        type_depense: 'Frais Bureau',
        montant: '',
        date_depense: new Date().toISOString().split('T')[0]
      });
      loadData();
    } else {
      setMessage('❌ Erreur lors de l\'enregistrement de la dépense');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSaveRecette = async () => {
    if (!newRecette.montant) {
      setMessage('Veuillez saisir un montant');
      return;
    }

    const recette: RecetteExceptionnelle = {
      type_recette: newRecette.type_recette,
      montant: parseFloat(newRecette.montant),
      date_recette: newRecette.date_recette,
      cree_par: username
    };

    const success = await saveRecetteExceptionnelle(recette);
    if (success) {
      setMessage('✅ Recette exceptionnelle enregistrée avec succès');
      setNewRecette({
        type_recette: 'Hamza',
        montant: '',
        date_recette: new Date().toISOString().split('T')[0]
      });
      loadData();
    } else {
      setMessage('❌ Erreur lors de l\'enregistrement de la recette');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSaveRistourne = async () => {
    if (!newRistourne.numero_contrat || !newRistourne.client || !newRistourne.montant_ristourne) {
      setMessage('Veuillez remplir tous les champs');
      return;
    }

    // Vérifier l'existence
    const exists = await checkRistourneExists(
      newRistourne.numero_contrat,
      newRistourne.date_ristourne,
      parseFloat(newRistourne.montant_ristourne),
      newRistourne.client
    );

    if (exists) {
      setMessage('❌ Cette ristourne existe déjà');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const ristourne: Ristourne = {
      numero_contrat: newRistourne.numero_contrat,
      client: newRistourne.client,
      montant_ristourne: parseFloat(newRistourne.montant_ristourne),
			date_paiement_ristourne:  new Date().toISOString().split('T')[0],
      date_ristourne: newRistourne.date_recette,
      cree_par: username
    };

    const success = await saveRistourne(ristourne);
    if (success) {
      setMessage('✅ Ristourne enregistrée avec succès');
      setNewRistourne({
        numero_contrat: '',
        client: '',
        montant_ristourne: '',
        date_ristourne: new Date().toISOString().split('T')[0]
      });
      loadData();
    } else {
      setMessage('❌ Erreur lors de l\'enregistrement de la ristourne');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSaveSinistre = async () => {
    if (!newSinistre.numero_sinistre || !newSinistre.client || !newSinistre.montant) {
      setMessage('Veuillez remplir tous les champs');
      return;
    }

    // Vérifier l'existence
    const exists = await checkSinistreExists(newSinistre.numero_sinistre);

    if (exists) {
      setMessage('❌ Ce numéro de sinistre existe déjà');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const sinistre: Sinistre = {
      numero_sinistre: newSinistre.numero_sinistre,
      montant: parseFloat(newSinistre.montant),
      client: newSinistre.client,
      date_sinistre: newSinistre.date_sinistre,
      cree_par: username
    };

    const success = await saveSinistre(sinistre);
    if (success) {
      setMessage('✅ Sinistre enregistré avec succès');
      setNewSinistre({
        numero_sinistre: '',
        montant: '',
        client: '',
        date_sinistre: new Date().toISOString().split('T')[0]
      });
      loadData();
    } else {
      setMessage('❌ Erreur lors de l\'enregistrement du sinistre');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const renderDepensesContent = () => (
    <div className="bg-red-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-red-800 mb-4">Gestion des Dépenses</h3>
      
      {/* Formulaire de saisie */}
      <div className="bg-white rounded-lg p-4 mb-6 border border-red-200">
        <h4 className="font-medium text-red-700 mb-4">Nouvelle Dépense</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type de dépense</label>
            <select
              value={newDepense.type_depense}
              onChange={(e) => setNewDepense({...newDepense, type_depense: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="Frais Bureau">Frais Bureau</option>
              <option value="Frais de Ménage">Frais de Ménage</option>
              <option value="STEG">STEG</option>
              <option value="SONED">SONED</option>
              <option value="A/S Ahlem">A/S Ahlem</option>
              <option value="A/S Islem">A/S Islem</option>
              <option value="Reprise sur Avance Client">Reprise sur Avance Client</option>
              <option value="Versement Bancaire">Versement Bancaire</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Montant (DT)</label>
            <input
              type="number"
              step="0.01"
              value={newDepense.montant}
              onChange={(e) => setNewDepense({...newDepense, montant: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            {canEditDates ? (
              <input
                type="date"
                value={newDepense.date_depense}
                onChange={(e) => setNewDepense({...newDepense, date_depense: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            ) : (
              <div className="w-full p-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-600">
                {new Date().toLocaleDateString('fr-FR')} (Date courante)
              </div>
            )}
          </div>
        </div>
        <button
          onClick={handleSaveDepense}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Enregistrer</span>
        </button>
      </div>

      {/* Liste des dépenses */}
      <div className="bg-white rounded-lg border border-red-200">
        <h4 className="font-medium text-red-700 p-4 border-b">Liste des Dépenses ({depenses.length})</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-red-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-red-600 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-red-600 uppercase tracking-wider">Montant (DT)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-red-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-red-600 uppercase tracking-wider">Créé par</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {depenses.map((depense) => (
                <tr key={depense.id} className="hover:bg-red-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{depense.type_depense}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                    {depense.montant.toLocaleString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {depense.date_depense ? new Date(depense.date_depense).toLocaleDateString('fr-FR') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{depense.cree_par}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {depenses.length === 0 && (
            <div className="text-center py-8 text-gray-500">Aucune dépense enregistrée</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderRecettesContent = () => (
    <div className="bg-green-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-green-800 mb-4">Recettes Exceptionnelles</h3>
      
      {/* Formulaire de saisie */}
      <div className="bg-white rounded-lg p-4 mb-6 border border-green-200">
        <h4 className="font-medium text-green-700 mb-4">Nouvelle Recette Exceptionnelle</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type de recette</label>
            <select
              value={newRecette.type_recette}
              onChange={(e) => setNewRecette({...newRecette, type_recette: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="Hamza">Hamza</option>
              <option value="Récupération A/S Ahlem">Récupération A/S Ahlem</option>
              <option value="Récupération A/S Islem">Récupération A/S Islem</option>
              <option value="Avance Client">Avance Client</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Montant (DT)</label>
            <input
              type="number"
              step="0.01"
              value={newRecette.montant}
              onChange={(e) => setNewRecette({...newRecette, montant: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            {canEditDates ? (
              <input
                type="date"
                value={newRecette.date_recette}
                onChange={(e) => setNewRecette({...newRecette, date_recette: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <div className="w-full p-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-600">
                {new Date().toLocaleDateString('fr-FR')} (Date courante)
              </div>
            )}
          </div>
        </div>
        <button
          onClick={handleSaveRecette}
          className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Enregistrer</span>
        </button>
      </div>

      {/* Liste des recettes */}
      <div className="bg-white rounded-lg border border-green-200">
        <h4 className="font-medium text-green-700 p-4 border-b">Liste des Recettes Exceptionnelles ({recettes.length})</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-green-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider">Montant (DT)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider">Créé par</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recettes.map((recette) => (
                <tr key={recette.id} className="hover:bg-green-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{recette.type_recette}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                    {recette.montant.toLocaleString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {recette.date_recette ? new Date(recette.date_recette).toLocaleDateString('fr-FR') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{recette.cree_par}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {recettes.length === 0 && (
            <div className="text-center py-8 text-gray-500">Aucune recette exceptionnelle enregistrée</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderRistournesContent = () => (
    <div className="bg-purple-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-purple-800 mb-4">Gestion des Ristournes</h3>
      
      {/* Formulaire de saisie */}
      <div className="bg-white rounded-lg p-4 mb-6 border border-purple-200">
        <h4 className="font-medium text-purple-700 mb-4">Nouvelle Ristourne</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Numéro du contrat</label>
            <input
              type="text"
              value={newRistourne.numero_contrat}
              onChange={(e) => setNewRistourne({...newRistourne, numero_contrat: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Numéro du contrat"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
            <input
              type="text"
              value={newRistourne.client}
              onChange={(e) => setNewRistourne({...newRistourne, client: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Nom du client"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Montant de la ristourne (DT)</label>
            <input
              type="number"
              step="0.01"
              value={newRistourne.montant_ristourne}
              onChange={(e) => setNewRistourne({...newRistourne, montant_ristourne: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date de ristourne</label>
            {canEditDates ? (
              <input
                type="date"
                value={newRistourne.date_ristourne}
                onChange={(e) => setNewRistourne({...newRistourne, date_ristourne: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            ) : (
              <div className="w-full p-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-600">
                {new Date().toLocaleDateString('fr-FR')} (Date courante)
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date de paiement</label>
            <div className="w-full p-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-600">
              {new Date().toLocaleDateString('fr-FR')} (Date courante automatique)
            </div>
          </div>
        </div>
        <button
          onClick={handleSaveRistourne}
          className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Enregistrer</span>
        </button>
      </div>

      {/* Liste des ristournes */}
      <div className="bg-white rounded-lg border border-purple-200">
        <h4 className="font-medium text-purple-700 p-4 border-b">Liste des Ristournes ({ristournes.length})</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-purple-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Contrat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Montant (DT)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Date Paiement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Créé par</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ristournes.map((ristourne) => (
                <tr key={ristourne.id} className="hover:bg-purple-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ristourne.numero_contrat}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ristourne.client}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-purple-600">
                    {ristourne.montant_ristourne.toLocaleString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ristourne.date_ristourne ? new Date(ristourne.date_ristourne).toLocaleDateString('fr-FR') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ristourne.date_paiement_ristourne ? new Date(ristourne.date_paiement_ristourne).toLocaleDateString('fr-FR') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ristourne.cree_par}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {ristournes.length === 0 && (
            <div className="text-center py-8 text-gray-500">Aucune ristourne enregistrée</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderSinistresContent = () => (
    <div className="bg-orange-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-orange-800 mb-4">Gestion des Sinistres</h3>
      
      {/* Formulaire de saisie */}
      <div className="bg-white rounded-lg p-4 mb-6 border border-orange-200">
        <h4 className="font-medium text-orange-700 mb-4">Nouveau Sinistre</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Numéro du sinistre</label>
            <input
              type="text"
              value={newSinistre.numero_sinistre}
              onChange={(e) => setNewSinistre({...newSinistre, numero_sinistre: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Numéro du sinistre"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
            <input
              type="text"
              value={newSinistre.client}
              onChange={(e) => setNewSinistre({...newSinistre, client: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Nom du client"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Montant (DT)</label>
            <input
              type="number"
              step="0.01"
              value={newSinistre.montant}
              onChange={(e) => setNewSinistre({...newSinistre, montant: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date du sinistre</label>
            {canEditDates ? (
              <input
                type="date"
                value={newSinistre.date_sinistre}
                onChange={(e) => setNewSinistre({...newSinistre, date_sinistre: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            ) : (
              <div className="w-full p-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-600">
                {new Date().toLocaleDateString('fr-FR')} (Date courante)
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date de paiement</label>
            <div className="w-full p-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-600">
              {new Date().toLocaleDateString('fr-FR')} (Date courante automatique)
            </div>
          </div>
        </div>
        <button
          onClick={handleSaveSinistre}
          className="mt-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Enregistrer</span>
        </button>
      </div>

      {/* Liste des sinistres */}
      <div className="bg-white rounded-lg border border-orange-200">
        <h4 className="font-medium text-orange-700 p-4 border-b">Liste des Sinistres ({sinistres.length})</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-orange-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-orange-600 uppercase tracking-wider">N° Sinistre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-orange-600 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-orange-600 uppercase tracking-wider">Montant (DT)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-orange-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-orange-600 uppercase tracking-wider">Date Paiement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-orange-600 uppercase tracking-wider">Créé par</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sinistres.map((sinistre) => (
                <tr key={sinistre.id} className="hover:bg-orange-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sinistre.numero_sinistre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sinistre.client}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-orange-600">
                    {sinistre.montant.toLocaleString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sinistre.date_sinistre ? new Date(sinistre.date_sinistre).toLocaleDateString('fr-FR') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sinistre.date_paiement_sinistre ? new Date(sinistre.date_paiement_sinistre).toLocaleDateString('fr-FR') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sinistre.cree_par}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {sinistres.length === 0 && (
            <div className="text-center py-8 text-gray-500">Aucun sinistre enregistré</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'depenses':
        return renderDepensesContent();
      case 'recettes':
        return renderRecettesContent();
      case 'ristournes':
        return renderRistournesContent();
      case 'sinistres':
        return renderSinistresContent();
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <DollarSign className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Gestion Financière</h2>
        </div>

        {/* Navigation des sections */}
        <div className="flex flex-wrap gap-2 mb-6">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive
                    ? `bg-${section.color}-100 text-${section.color}-700 border-2 border-${section.color}-300`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{section.label}</span>
              </button>
            );
          })}
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg text-sm ${
            message.includes('succès') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Contenu de la section active */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2">Chargement...</span>
          </div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  );
};

export default FinancialManagement;
