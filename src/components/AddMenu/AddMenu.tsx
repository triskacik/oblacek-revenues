import useAddEntry from '@/hooks/useAddEntry'
import { cn } from '@/lib/utils'
import { Package, Plus, ReceiptText, ShoppingBasket } from 'lucide-react'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui'

type Props = {
  /** `fab`: round button for the mobile bottom bar. */
  variant?: 'button' | 'fab'
}

const AddMenu = ({ variant = 'button' }: Props) => {
  const { openExpense, openSale, openZasilkovna } = useAddEntry()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === 'fab' ? (
          <button
            aria-label='Přidat'
            className='flex size-12 shrink-0 items-center justify-center rounded-full bg-terracotta text-cream shadow-md shadow-terracotta/30 transition-colors hover:bg-terracotta/90'
            type='button'
          >
            <Plus className='size-6' />
          </button>
        ) : (
          <Button className='rounded-full bg-terracotta px-5 text-cream shadow-sm hover:bg-terracotta/90'>
            <Plus /> Přidat
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={variant === 'fab' ? 'center' : 'end'}
        className={cn('w-56 rounded-xl p-1.5', variant === 'fab' && 'mb-2')}
        side={variant === 'fab' ? 'top' : 'bottom'}
      >
        <DropdownMenuItem className='gap-3 py-2.5' onClick={() => openSale()}>
          <ShoppingBasket className='text-terracotta' /> Tržba
        </DropdownMenuItem>
        <DropdownMenuItem className='gap-3 py-2.5' onClick={() => openExpense()}>
          <ReceiptText className='text-warning-foreground' /> Výdaj
        </DropdownMenuItem>
        <DropdownMenuItem className='gap-3 py-2.5' onClick={() => openZasilkovna()}>
          <Package className='text-olive-soft' /> Zásilkovna
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default AddMenu
