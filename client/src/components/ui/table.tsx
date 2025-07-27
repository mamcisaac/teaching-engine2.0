import { forwardRef, type HTMLAttributes, type TdHTMLAttributes, type ThHTMLAttributes } from "react"

import { cn } from "@/lib/utils"

const Table = forwardRef<
  HTMLTableElement,
  HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref): JSX.Element => {
  const classNames: string = cn("w-full caption-bottom text-sm", className ?? "");
  return (
    <div className="relative w-full overflow-auto">
      <table
        className={classNames}
        ref={ref}
        {...props}
      />
    </div>
  );
})
Table.displayName = "Table"

const TableHeader = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref): JSX.Element => {
  const classNames: string = cn("[&_tr]:border-b", className ?? "");
  return <thead className={classNames} ref={ref} {...props} />;
})
TableHeader.displayName = "TableHeader"

const TableBody = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref): JSX.Element => {
  const classNames: string = cn("[&_tr:last-child]:border-0", className ?? "");
  return (
    <tbody
      className={classNames}
      ref={ref}
      {...props}
    />
  );
})
TableBody.displayName = "TableBody"

const TableFooter = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref): JSX.Element => {
  const classNames: string = cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className ?? "");
  return (
    <tfoot
      className={classNames}
      ref={ref}
      {...props}
    />
  );
})
TableFooter.displayName = "TableFooter"

const TableRow = forwardRef<
  HTMLTableRowElement,
  HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref): JSX.Element => {
  const classNames: string = cn(
    "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
    className ?? ""
  );
  return (
    <tr
      className={classNames}
      ref={ref}
      {...props}
    />
  );
})
TableRow.displayName = "TableRow"

const TableHead = forwardRef<
  HTMLTableCellElement,
  ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref): JSX.Element => {
  const classNames: string = cn(
    "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
    className ?? ""
  );
  return (
    <th
      className={classNames}
      ref={ref}
      {...props}
    />
  );
})
TableHead.displayName = "TableHead"

const TableCell = forwardRef<
  HTMLTableCellElement,
  TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref): JSX.Element => {
  const classNames: string = cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className ?? "");
  return (
    <td
      className={classNames}
      ref={ref}
      {...props}
    />
  );
})
TableCell.displayName = "TableCell"

const TableCaption = forwardRef<
  HTMLTableCaptionElement,
  HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref): JSX.Element => {
  const classNames: string = cn("mt-4 text-sm text-muted-foreground", className ?? "");
  return (
    <caption
      className={classNames}
      ref={ref}
      {...props}
    />
  );
})
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}