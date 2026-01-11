import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Proposal, ProposalFormData, ProposalStatus } from '@/types/proposal';
import { calculatePricing } from '@/lib/pricing';

interface ProposalStore {
  proposals: Proposal[];
  currentDraft: Partial<ProposalFormData> | null;
  
  // Actions
  setDraft: (data: Partial<ProposalFormData>) => void;
  clearDraft: () => void;
  createProposal: (formData: ProposalFormData) => Proposal;
  updateProposalStatus: (id: string, status: ProposalStatus) => void;
  deleteProposal: (id: string) => void;
  getProposal: (id: string) => Proposal | undefined;
}

export const useProposalStore = create<ProposalStore>()(
  persist(
    (set, get) => ({
      proposals: [],
      currentDraft: null,
      
      setDraft: (data) => set((state) => ({
        currentDraft: { ...state.currentDraft, ...data }
      })),
      
      clearDraft: () => set({ currentDraft: null }),
      
      createProposal: (formData) => {
        const pricing = calculatePricing(formData);
        const newProposal: Proposal = {
          id: crypto.randomUUID(),
          formData,
          pricing,
          status: 'draft',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set((state) => ({
          proposals: [newProposal, ...state.proposals],
          currentDraft: null,
        }));
        
        return newProposal;
      },
      
      updateProposalStatus: (id, status) => set((state) => ({
        proposals: state.proposals.map((p) =>
          p.id === id ? { ...p, status, updatedAt: new Date() } : p
        ),
      })),
      
      deleteProposal: (id) => set((state) => ({
        proposals: state.proposals.filter((p) => p.id !== id),
      })),
      
      getProposal: (id) => get().proposals.find((p) => p.id === id),
    }),
    {
      name: 'precifix-proposals',
    }
  )
);
