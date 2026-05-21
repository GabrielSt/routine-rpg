import { useState, useRef, useCallback } from 'react'
import html2canvas from 'html2canvas'
import { useGame } from '../store/GameContext'
import { SHOP_ITEMS, type ShopItem, type PurchasedItem } from '../lib/storage'
import { SectionTitle, Button } from '../components/ui'
import { ShoppingBag, History, X, Share2, Download, CheckCircle } from 'lucide-react'
import type { GlowColor } from '../lib/rpg'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_META: Record<string, { label: string; color: GlowColor; hex: string }> = {
  food:     { label: 'Comida & Bebida', color: 'yellow',  hex: '#ffee00' },
  leisure:  { label: 'Lazer',           color: 'cyan',    hex: '#00f5ff' },
  wellness: { label: 'Bem-estar',       color: 'green',   hex: '#00ff88' },
  gear:     { label: 'Equipamento',     color: 'magenta', hex: '#ff00aa' },
}

// ─────────────────────────────────────────────────────────────────────────────
// Receipt
// ─────────────────────────────────────────────────────────────────────────────

interface ReceiptProps {
  item: ShopItem
  credsBefore: number
  credsAfter: number
  characterName: string
  date: string
  txId: string
  onClose: () => void
}

function Receipt({ item, credsBefore, credsAfter, characterName, date, txId, onClose }: ReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null)
  const [sharing, setSharing] = useState(false)
  const meta = CATEGORY_META[item.category]

  const capture = useCallback(async (): Promise<HTMLCanvasElement | null> => {
    if (!receiptRef.current) return null
    return html2canvas(receiptRef.current, {
      backgroundColor: '#ffffff',
      scale: 3,
      useCORS: true,
      logging: false,
    })
  }, [])

  const handleDownload = async () => {
    setSharing(true)
    const canvas = await capture()
    if (!canvas) { setSharing(false); return }
    const link = document.createElement('a')
    link.download = `recibo-${item.id}-${txId}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    setSharing(false)
  }

  const handleShare = async () => {
    setSharing(true)
    const canvas = await capture()
    if (!canvas) { setSharing(false); return }
    canvas.toBlob(async (blob) => {
      if (!blob) { setSharing(false); return }
      const file = new File([blob], `recibo-${item.id}.png`, { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `Recompensa: ${item.label}` })
      } else {
        const link = document.createElement('a')
        link.download = file.name
        link.href = URL.createObjectURL(blob)
        link.click()
      }
      setSharing(false)
    }, 'image/png')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-xs mx-auto animate-fade-in-up">

        {/* Paper receipt — white, thermal printer style */}
        <div ref={receiptRef} style={{ backgroundColor: '#ffffff', fontFamily: "'Share Tech Mono', monospace" }} className="relative">

          {/* Torn top edge */}
          <div style={{ height: 12, background: 'linear-gradient(135deg, #fff 25%, transparent 25%) -6px 0, linear-gradient(225deg, #fff 25%, transparent 25%) -6px 0, linear-gradient(315deg, #fff 25%, transparent 25%), linear-gradient(45deg, #fff 25%, transparent 25%)', backgroundSize: '12px 12px', backgroundColor: '#f0f0f0' }} />

          {/* Logo / Header */}
          <div style={{ padding: '16px 24px 12px', textAlign: 'center', borderBottom: '1px dashed #ccc' }}>
            <div style={{ fontSize: 9, color: '#999', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 2 }}>
              EDGE PROTOCOL SYSTEM
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#111', letterSpacing: '0.15em', fontFamily: "'Orbitron', monospace" }}>
              BLACK MARKET
            </div>
            <div style={{ fontSize: 8, color: '#bbb', letterSpacing: '0.25em', textTransform: 'uppercase', marginTop: 2 }}>
              COMPROVATIVO DE COMPRA
            </div>
          </div>

          {/* Item */}
          <div style={{ padding: '16px 24px', borderBottom: '1px dashed #ccc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 36 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111', fontFamily: "'Orbitron', monospace", lineHeight: 1.3 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 8, color: '#888', textTransform: 'uppercase', letterSpacing: '0.2em', marginTop: 2 }}>
                  {meta.label}
                </div>
              </div>
            </div>
            <div style={{ fontSize: 9, color: '#666', lineHeight: 1.6 }}>{item.desc}</div>
          </div>

          {/* Transaction details */}
          <div style={{ padding: '12px 24px', borderBottom: '1px dashed #ccc', fontSize: 9, color: '#555' }}>
            {[
              ['RUNNER',         characterName.toUpperCase()],
              ['DATA / HORA',    date],
              ['TX ID',          txId],
              ['MÉTODO',         'EDGE CREDS'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ color: '#aaa' }}>{label}</span>
                <span style={{ color: '#333' }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Amounts */}
          <div style={{ padding: '12px 24px', borderBottom: '2px solid #111' }}>
            {[
              ['SALDO ANTERIOR', `₡ ${credsBefore}`, '#555'],
              ['DESCONTO',       `- ₡ ${item.cost}`,  '#cc3333'],
            ].map(([label, value, color]) => (
              <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 9 }}>
                <span style={{ color: '#aaa' }}>{label as string}</span>
                <span style={{ color: color as string, fontWeight: 700 }}>{value as string}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: 10, color: '#111', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                SALDO FINAL
              </span>
              <span style={{ fontSize: 18, fontWeight: 900, color: '#111', fontFamily: "'Orbitron', monospace" }}>
                ₡ {credsAfter}
              </span>
            </div>
          </div>

          {/* Status */}
          <div style={{ padding: '12px 24px', textAlign: 'center', borderBottom: '1px dashed #ccc' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 14 }}>✅</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#229944', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                APROVADO
              </span>
            </div>
            <div style={{ fontSize: 8, color: '#999', lineHeight: 1.6 }}>
              Mereces esta recompensa.<br />Continua o bom trabalho, Runner.
            </div>
          </div>

          {/* Barcode */}
          <div style={{ padding: '12px 24px 8px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 1, marginBottom: 4 }}>
              {Array.from({ length: 48 }, (_, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: '#222',
                    width: i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : 1,
                    height: i % 7 === 0 ? 28 : i % 4 === 0 ? 22 : 18,
                  }}
                />
              ))}
            </div>
            <div style={{ fontSize: 7, color: '#bbb', letterSpacing: '0.3em' }}>
              {txId}-EDGE-PROTOCOL
            </div>
          </div>

          {/* Torn bottom edge */}
          <div style={{ height: 12, background: 'linear-gradient(315deg, #fff 25%, transparent 25%) -6px 0, linear-gradient(45deg, #fff 25%, transparent 25%) -6px 0, linear-gradient(135deg, #fff 25%, transparent 25%), linear-gradient(225deg, #fff 25%, transparent 25%)', backgroundSize: '12px 12px', backgroundColor: '#f0f0f0' }} />
        </div>

        {/* Actions — outside receipt, not captured */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-2 border border-[#ffffff22] text-[#8888aa] font-mono-tech text-xs uppercase tracking-widest hover:border-[#8888aa] transition-all rounded-sm cursor-pointer"
          >
            <X size={14} /> Fechar
          </button>
          <button
            onClick={handleDownload}
            disabled={sharing}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-[#00f5ff33] text-[#00f5ff] font-mono-tech text-xs uppercase tracking-widest hover:bg-[#00f5ff11] transition-all rounded-sm cursor-pointer disabled:opacity-40"
          >
            <Download size={14} /> Guardar
          </button>
          <button
            onClick={handleShare}
            disabled={sharing}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-[#ffee0033] text-[#ffee00] font-mono-tech text-xs uppercase tracking-widest hover:bg-[#ffee0011] transition-all rounded-sm cursor-pointer disabled:opacity-40"
          >
            <Share2 size={14} /> Partilhar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Confirm Modal
// ─────────────────────────────────────────────────────────────────────────────

interface ConfirmModalProps {
  item: ShopItem
  creds: number
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmModal({ item, creds, onConfirm, onCancel }: ConfirmModalProps) {
  const meta = CATEGORY_META[item.category]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-sm bg-[#0a0a1a] border rounded-sm p-6 animate-fade-in-up space-y-5"
        style={{ borderColor: `${meta.hex}44` }}
      >
        <div className="text-center">
          <div className="font-mono-tech text-[10px] text-[#8888aa] tracking-widest mb-3">// CONFIRMAR COMPRA //</div>
          <span className="text-5xl">{item.icon}</span>
          <div className="font-orbitron text-sm text-white font-bold mt-3">{item.label}</div>
          <div className="font-mono-tech text-[10px] text-[#8888aa] mt-1 leading-relaxed">{item.desc}</div>
        </div>

        <div className="border-t border-dashed border-[#1a1a3a] pt-4 space-y-2 font-mono-tech text-xs">
          <div className="flex justify-between">
            <span className="text-[#8888aa]">Custo</span>
            <span style={{ color: meta.hex }} className="font-bold">₡ {item.cost}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8888aa]">Saldo atual</span>
            <span className="text-white">₡ {creds}</span>
          </div>
          <div className="flex justify-between border-t border-[#1a1a3a] pt-2">
            <span className="text-[#8888aa]">Saldo após compra</span>
            <span className="text-[#ffee00] font-bold">₡ {creds - item.cost}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="cyan" onClick={onCancel} className="flex-1">Cancelar</Button>
          <Button variant={meta.color} onClick={onConfirm} className="flex-1">⚡ Confirmar</Button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Item Card
// ─────────────────────────────────────────────────────────────────────────────

function ItemCard({ item, canAfford, onBuy }: { item: ShopItem; canAfford: boolean; onBuy: () => void }) {
  const meta = CATEGORY_META[item.category]
  return (
    <div
      className="bg-[#0a0a1a] border rounded-sm p-4 flex flex-col gap-3 transition-all duration-300"
      style={{
        borderColor: canAfford ? `${meta.hex}33` : '#1a1a3a',
        boxShadow: canAfford ? `0 0 12px ${meta.hex}0d` : 'none',
      }}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl">{item.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-orbitron text-xs text-white font-bold leading-tight">{item.label}</div>
          <div className="font-mono-tech text-[10px] text-[#8888aa] mt-1 leading-relaxed">{item.desc}</div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#1a1a3a]">
        <div className="flex items-center gap-1">
          <span className="font-mono-tech text-sm font-bold" style={{ color: meta.hex }}>₡ {item.cost}</span>
          <span className="font-mono-tech text-[9px] text-[#8888aa] uppercase">creds</span>
        </div>
        <Button variant={meta.color} onClick={onBuy} disabled={!canAfford} className="text-[9px] px-3 py-1">
          Comprar
        </Button>
      </div>
      {!canAfford && (
        <div className="font-mono-tech text-[9px] text-[#555577] text-right -mt-1">// creds insuficientes</div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Shop Page
// ─────────────────────────────────────────────────────────────────────────────

type ReceiptData = {
  item: ShopItem
  credsBefore: number
  credsAfter: number
  txId: string
  date: string
}

type ModalState =
  | { stage: 'none' }
  | { stage: 'confirm'; item: ShopItem }
  | { stage: 'receipt' } & ReceiptData

function generateTxId() {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

function nowDateStr() {
  return new Date().toLocaleString('pt-PT', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

export default function Shop() {
  const { state, buyItem } = useGame()
  const { character, purchases = [] } = state
  const creds = character.creds ?? 0
  const [activeTab, setActiveTab] = useState<'shop' | 'history'>('shop')
  const [modal, setModal] = useState<ModalState>({ stage: 'none' })

  const handleBuyClick = (item: ShopItem) => setModal({ stage: 'confirm', item })

  const handleConfirm = () => {
    if (modal.stage !== 'confirm') return
    const { item } = modal
    const credsBefore = creds
    const credsAfter = credsBefore - item.cost
    const txId = generateTxId()
    const date = nowDateStr()
    buyItem(item.id, item.cost, txId, date)
    setModal({ stage: 'receipt', item, credsBefore, credsAfter, txId, date })
  }

  const openReceiptFromHistory = (p: PurchasedItem) => {
    const item = SHOP_ITEMS.find((s) => s.id === p.itemId)
    if (!item) return
    setModal({
      stage: 'receipt',
      item,
      credsBefore: p.credsBefore,
      credsAfter: p.credsAfter,
      txId: p.txId,
      date: p.date,
    })
  }

  const categories = ['food', 'leisure', 'wellness', 'gear'] as const

  return (
    <>
      <div className="animate-fade-in-up space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between py-1">
          <span className="font-mono-tech text-[10px] text-[#00f5ff] uppercase tracking-widest">// BLACK MARKET //</span>
          <div className="flex items-center gap-2 bg-[#0a0a1a] border border-[#ffee0033] rounded-sm px-3 py-1.5">
            <span className="font-orbitron text-sm font-bold text-[#ffee00]">₡ {creds}</span>
            <span className="font-mono-tech text-[9px] text-[#8888aa] uppercase">creds</span>
          </div>
        </div>

        {/* Info */}
        <div className="bg-[#0a0a1a] border border-[#1a1a3a] rounded-sm px-4 py-3">
          <p className="font-mono-tech text-[10px] text-[#8888aa] leading-relaxed">
            // Ganhas <span className="text-[#ffee00]">₡ Creds</span> ao completar quests e ao subir de level.
            Usa-os para desbloquear recompensas reais que mereces pelo teu esforço. //
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#1a1a3a]">
          {(['shop', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2 font-mono-tech text-xs uppercase tracking-widest transition-all duration-200 cursor-pointer
                ${activeTab === tab
                  ? 'text-[#00f5ff] border-b-2 border-[#00f5ff] -mb-px'
                  : 'text-[#8888aa] hover:text-[#00f5ff66]'
                }`}
            >
              {tab === 'shop' ? <ShoppingBag size={14} /> : <History size={14} />}
              {tab === 'shop' ? 'Loja' : `Histórico${purchases.length > 0 ? ` (${purchases.length})` : ''}`}
            </button>
          ))}
        </div>

        {/* Shop grid */}
        {activeTab === 'shop' && (
          <div className="space-y-6">
            {categories.map((cat) => {
              const items = SHOP_ITEMS.filter((i) => i.category === cat)
              const meta = CATEGORY_META[cat]
              return (
                <div key={cat}>
                  <SectionTitle color={meta.color}>{meta.label}</SectionTitle>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                    {items.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        canAfford={creds >= item.cost}
                        onBuy={() => handleBuyClick(item)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* History */}
        {activeTab === 'history' && (
          <div className="bg-[#0a0a1a] border border-[#1a1a3a] rounded-sm p-4">
            <SectionTitle color="cyan">Compras Realizadas</SectionTitle>
            {purchases.length === 0 ? (
              <p className="font-mono-tech text-xs text-[#8888aa]">Nenhuma compra ainda. Completa quests e ganha Creds!</p>
            ) : (
              <div className="space-y-1">
                {([...purchases] as PurchasedItem[]).reverse().map((p, i) => {
                  const item = SHOP_ITEMS.find((s) => s.id === p.itemId)
                  if (!item) return null
                  const meta = CATEGORY_META[item.category]
                  const hasReceiptData = p.txId != null
                  return (
                    <button
                      key={i}
                      onClick={() => hasReceiptData && openReceiptFromHistory(p)}
                      className={`w-full flex items-center gap-3 py-3 px-2 border-b border-[#1a1a3a] text-left transition-all duration-200 rounded-sm
                        ${hasReceiptData ? 'cursor-pointer hover:bg-[#ffffff08] group' : 'cursor-default'}`}
                    >
                      <span className="text-xl flex-shrink-0">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-orbitron text-xs text-white group-hover:text-[#00f5ff] transition-colors">
                          {item.label}
                        </div>
                        <div className="font-mono-tech text-[9px] text-[#8888aa]">{p.date}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="font-mono-tech text-xs font-bold" style={{ color: meta.hex }}>
                          ₡ {item.cost}
                        </span>
                        {hasReceiptData && (
                          <span className="font-mono-tech text-[8px] text-[#8888aa] group-hover:text-[#00f5ff] transition-colors uppercase tracking-widest">
                            recibo →
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirm modal */}
      {modal.stage === 'confirm' && (
        <ConfirmModal
          item={modal.item}
          creds={creds}
          onConfirm={handleConfirm}
          onCancel={() => setModal({ stage: 'none' })}
        />
      )}

      {/* Receipt modal */}
      {modal.stage === 'receipt' && (
        <Receipt
          item={modal.item}
          credsBefore={modal.credsBefore}
          credsAfter={modal.credsAfter}
          characterName={character.name}
          date={modal.date}
          txId={modal.txId}
          onClose={() => setModal({ stage: 'none' })}
        />
      )}
    </>
  )
}
